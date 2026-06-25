package handlers

import (
	"net/http"

	"github.com/edumatch/backend/internal/models"
	"github.com/edumatch/backend/internal/repositories"
	"github.com/gin-gonic/gin"
)

type ApplicationHandler struct {
	apps     *repositories.ApplicationRepository
	projects *repositories.ProjectRepository
}

func NewApplicationHandler(apps *repositories.ApplicationRepository, projects *repositories.ProjectRepository) *ApplicationHandler {
	return &ApplicationHandler{apps: apps, projects: projects}
}

func (h *ApplicationHandler) Apply(c *gin.Context) {
	projectID := c.Param("id")
	userID := c.GetString("user_id")

	project, err := h.projects.GetByID(c.Request.Context(), projectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "проект не найден"})
		return
	}
	if project.OwnerID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "нельзя подать заявку на свой проект"})
		return
	}

	id, err := h.apps.Create(c.Request.Context(), projectID, userID)
	if err != nil {
		if err == repositories.ErrAlreadyApplied {
			c.JSON(http.StatusConflict, gin.H{"error": "вы уже подали заявку"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": id})
}

func (h *ApplicationHandler) GetProjectApplications(c *gin.Context) {
	projectID := c.Param("id")
	userID := c.GetString("user_id")

	project, err := h.projects.GetByID(c.Request.Context(), projectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "проект не найден"})
		return
	}
	if project.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "нет доступа"})
		return
	}

	apps, err := h.apps.GetByProject(c.Request.Context(), projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}
	if apps == nil {
		apps = []models.Application{}
	}
	c.JSON(http.StatusOK, gin.H{"applications": apps})
}

func (h *ApplicationHandler) GetMyApplications(c *gin.Context) {
	userID := c.GetString("user_id")

	apps, err := h.apps.GetByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}
	if apps == nil {
		apps = []models.Application{}
	}
	c.JSON(http.StatusOK, gin.H{"applications": apps})
}

func (h *ApplicationHandler) Accept(c *gin.Context) {
	h.updateStatus(c, "accepted")
}

func (h *ApplicationHandler) Reject(c *gin.Context) {
	h.updateStatus(c, "rejected")
}

func (h *ApplicationHandler) updateStatus(c *gin.Context, status string) {
	appID := c.Param("appId")
	userID := c.GetString("user_id")

	app, err := h.apps.GetByID(c.Request.Context(), appID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "заявка не найдена"})
		return
	}

	project, err := h.projects.GetByID(c.Request.Context(), app.ProjectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "проект не найден"})
		return
	}
	if project.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "нет прав"})
		return
	}

	if err := h.apps.UpdateStatus(c.Request.Context(), appID, status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": status})
}
