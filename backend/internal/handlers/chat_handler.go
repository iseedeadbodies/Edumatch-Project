package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/edumatch/backend/internal/models"
	"github.com/edumatch/backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/net/websocket"
)

type Client struct {
	conn      *websocket.Conn
	projectID string
	userID    string
}

type Hub struct {
	mu      sync.Mutex
	clients map[string][]*Client
}

var hub = &Hub{
	clients: make(map[string][]*Client),
}

func (h *Hub) add(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[c.projectID] = append(h.clients[c.projectID], c)
}

func (h *Hub) remove(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	list := h.clients[c.projectID]
	newList := make([]*Client, 0, len(list))
	for _, cl := range list {
		if cl != c {
			newList = append(newList, cl)
		}
	}
	h.clients[c.projectID] = newList
}

func (h *Hub) broadcast(projectID string, msg []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for _, c := range h.clients[projectID] {
		if err := websocket.Message.Send(c.conn, string(msg)); err != nil {
			log.Printf("broadcast error: %v", err)
		}
	}
}

type ChatHandler struct {
	messages  *repositories.MessageRepository
	jwtSecret string
}

func NewChatHandler(messages *repositories.MessageRepository, jwtSecret string) *ChatHandler {
	return &ChatHandler{messages: messages, jwtSecret: jwtSecret}
}

type incomingMessage struct {
	Content string `json:"content"`
}

type outgoingMessage struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
	UserID    string `json:"user_id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
}

func (h *ChatHandler) HandleWS(c *gin.Context) {
	projectID := c.Param("id")

	tokenStr := c.Query("token")
	if tokenStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "токен не передан"})
		return
	}

	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		return []byte(h.jwtSecret), nil
	})
	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "невалидный токен"})
		return
	}

	claims := token.Claims.(jwt.MapClaims)
	userID := claims["user_id"].(string)

	websocket.Handler(func(ws *websocket.Conn) {
		client := &Client{conn: ws, projectID: projectID, userID: userID}
		hub.add(client)
		defer hub.remove(client)

		log.Printf("WS: пользователь %s подключился к проекту %s", userID, projectID)

		for {
			var raw string
			if err := websocket.Message.Receive(ws, &raw); err != nil {
				log.Printf("WS disconnect: %v", err)
				break
			}

			var incoming incomingMessage
			if err := json.Unmarshal([]byte(raw), &incoming); err != nil || incoming.Content == "" {
				continue
			}

			msg, err := h.messages.Create(c.Request.Context(), projectID, userID, incoming.Content)
			if err != nil {
				log.Printf("WS save error: %v", err)
				continue
			}

			out := outgoingMessage{
				ID:        msg.ID,
				ProjectID: msg.ProjectID,
				UserID:    msg.UserID,
				Content:   msg.Content,
				CreatedAt: msg.CreatedAt.Format("2006-01-02T15:04:05Z"),
			}
			data, _ := json.Marshal(out)
			hub.broadcast(projectID, data)
		}
	}).ServeHTTP(c.Writer, c.Request)
}

func (h *ChatHandler) GetHistory(c *gin.Context) {
	projectID := c.Param("id")
	messages, err := h.messages.GetByProject(c.Request.Context(), projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}
	if messages == nil {
		messages = []models.Message{}
	}
	c.JSON(http.StatusOK, gin.H{"messages": messages})
}
