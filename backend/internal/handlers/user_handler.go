package handlers

import (
	"net/http"

	"github.com/edumatch/backend/internal/repositories"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	users *repositories.UserRepository
}

func NewUserHandler(users *repositories.UserRepository) *UserHandler {
	return &UserHandler{users: users}
}

func (h *UserHandler) GetMe(c *gin.Context) {
	userID := c.GetString("user_id")

	user, err := h.users.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "пользователь не найден"})
		return
	}

	c.JSON(http.StatusOK, user)
}

type updateProfileRequest struct {
	FullName   string   `json:"full_name"`
	University string   `json:"university"`
	Course     int      `json:"course"`
	AboutMe    string   `json:"about_me"`
	Skills     []string `json:"skills"`
}

func (h *UserHandler) UpdateMe(c *gin.Context) {
	userID := c.GetString("user_id")

	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.users.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "пользователь не найден"})
		return
	}

	user.FullName = req.FullName
	user.University = req.University
	user.Course = req.Course
	user.AboutMe = req.AboutMe
	user.Skills = req.Skills

	if err := h.users.Update(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}

	c.JSON(http.StatusOK, user)
}
func (h *UserHandler) ListUsers(c *gin.Context) {
	skills := c.Query("skills")
	users, err := h.users.ListUsers(c.Request.Context(), skills)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"users": users})
}