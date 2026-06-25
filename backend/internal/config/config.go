package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	DatabaseURL   string
	JWTSecret     string
	JWTTTLHours   int
	AllowedOrigin string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("Файл .env не найден, использую переменные окружения системы")
	}

	ttl, _ := strconv.Atoi(getEnv("JWT_TTL_HOURS", "24"))

	cfg := &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   getEnv("DATABASE_URL", ""),
		JWTSecret:     getEnv("JWT_SECRET", ""),
		JWTTTLHours:   ttl,
		AllowedOrigin: getEnv("ALLOWED_ORIGIN", "http://localhost:3000"),
	}

	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL не задан")
	}
	if cfg.JWTSecret == "" {
		log.Fatal("JWT_SECRET не задан")
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
