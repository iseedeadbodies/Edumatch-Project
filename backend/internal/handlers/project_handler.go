package handlers

import (
	"net/http"
	"time"

	"github.com/edumatch/backend/internal/models"
	"github.com/edumatch/backend/internal/repositories"
	"github.com/edumatch/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type ProjectHandler struct {
	projects *services.ProjectService
}

func NewProjectHandler(projects *services.ProjectService) *ProjectHandler {
	return &ProjectHandler{projects: projects}
}

type projectRequest struct {
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description"`
	TechStack   []string `json:"tech_stack"`
	Deadline    string   `json:"deadline"`
}

func (h *ProjectHandler) List(c *gin.Context) {
	search := c.Query("search")
	stack := c.Query("stack")

	projects, err := h.projects.List(c.Request.Context(), search, stack)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}

	if projects == nil {
		projects = []models.Project{}
	}

	c.JSON(http.StatusOK, gin.H{"projects": projects})
}

func (h *ProjectHandler) Get(c *gin.Context) {
	id := c.Param("id")
	project, err := h.projects.Get(c.Request.Context(), id)
	if err != nil {
		if err == repositories.ErrProjectNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "проект не найден"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}
	c.JSON(http.StatusOK, project)
}

func (h *ProjectHandler) Create(c *gin.Context) {
	var req projectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ownerID := c.GetString("user_id")

	var deadline time.Time
	if req.Deadline != "" {
		var err error
		deadline, err = time.Parse("2006-01-02", req.Deadline)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "дедлайн должен быть в формате YYYY-MM-DD"})
			return
		}
	}

	id, err := h.projects.Create(c.Request.Context(), ownerID, req.Title, req.Description, req.TechStack, deadline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": id})
}

func (h *ProjectHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req projectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	requesterID := c.GetString("user_id")

	var deadline time.Time
	if req.Deadline != "" {
		var err error
		deadline, err = time.Parse("2006-01-02", req.Deadline)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "дедлайн должен быть в формате YYYY-MM-DD"})
			return
		}
	}

	err := h.projects.Update(c.Request.Context(), id, requesterID, req.Title, req.Description, req.TechStack, deadline)
	if err != nil {
		switch err {
		case services.ErrNotOwner:
			c.JSON(http.StatusForbidden, gin.H{"error": "нет прав на изменение"})
		case repositories.ErrProjectNotFound:
			c.JSON(http.StatusNotFound, gin.H{"error": "проект не найден"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "проект обновлён"})
}

func (h *ProjectHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	requesterID := c.GetString("user_id")

	err := h.projects.Delete(c.Request.Context(), id, requesterID)
	if err != nil {
		switch err {
		case services.ErrNotOwner:
			c.JSON(http.StatusForbidden, gin.H{"error": "нет прав на удаление"})
		case repositories.ErrProjectNotFound:
			c.JSON(http.StatusNotFound, gin.H{"error": "проект не найден"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "проект удалён"})
}
