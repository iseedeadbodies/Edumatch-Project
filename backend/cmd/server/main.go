package main

import (
	"context"
	"log"
	"net/http"

	"github.com/edumatch/backend/internal/config"
	"github.com/edumatch/backend/internal/handlers"
	"github.com/edumatch/backend/internal/middleware"
	"github.com/edumatch/backend/internal/repositories"
	"github.com/edumatch/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	cfg := config.Load()

	db, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Не удалось подключиться к PostgreSQL: %v", err)
	}
	defer db.Close()

	if err := db.Ping(context.Background()); err != nil {
		log.Fatalf("PostgreSQL не отвечает: %v", err)
	}
	log.Println("PostgreSQL подключён")

	userRepo := repositories.NewUserRepository(db)
	projectRepo := repositories.NewProjectRepository(db)
	appRepo := repositories.NewApplicationRepository(db)
	messageRepo := repositories.NewMessageRepository(db)

	authSvc := services.NewAuthService(userRepo, cfg.JWTSecret, cfg.JWTTTLHours)
	projectSvc := services.NewProjectService(projectRepo)

	authHandler := handlers.NewAuthHandler(authSvc)
	projectHandler := handlers.NewProjectHandler(projectSvc)
	userHandler := handlers.NewUserHandler(userRepo)
	appHandler := handlers.NewApplicationHandler(appRepo, projectRepo, userRepo)
	chatHandler := handlers.NewChatHandler(messageRepo, cfg.JWTSecret)

	router := gin.Default()

	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := router.Group("/api/v1")
	api.POST("/auth/register", authHandler.Register)
	api.POST("/auth/login", authHandler.Login)

	protected := api.Group("/")
	protected.Use(middleware.AuthRequired(cfg.JWTSecret))
	{
		protected.GET("/users/me", userHandler.GetMe)
		protected.PUT("/users/me", userHandler.UpdateMe)
		protected.GET("/users", userHandler.ListUsers)
		protected.GET("/projects", projectHandler.List)
		protected.POST("/projects", projectHandler.Create)
		protected.GET("/projects/:id", projectHandler.Get)
		protected.PUT("/projects/:id", projectHandler.Update)
		protected.DELETE("/projects/:id", projectHandler.Delete)
		protected.POST("/projects/:id/apply", appHandler.Apply)
		protected.DELETE("/projects/:id/leave", appHandler.Leave)
		protected.GET("/projects/:id/applications", appHandler.GetProjectApplications)
		protected.GET("/projects/:id/members", appHandler.GetMembers)
		protected.GET("/projects/:id/messages", chatHandler.GetHistory)
		protected.GET("/applications/me", appHandler.GetMyApplications)
		protected.PUT("/applications/:appId/accept", appHandler.Accept)
		protected.PUT("/applications/:appId/reject", appHandler.Reject)
	}

	router.GET("/ws/projects/:id", chatHandler.HandleWS)

	log.Printf("Сервер запущен на порту %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Ошибка запуска сервера: %v", err)
	}
}
