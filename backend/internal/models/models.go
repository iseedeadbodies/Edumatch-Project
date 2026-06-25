package models

import "time"

type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"` // "-" — не отдаём хеш пароля в JSON-ответах
	FullName     string    `json:"full_name" db:"full_name"`
	University   string    `json:"university" db:"university"`
	Course       int       `json:"course" db:"course"`
	AboutMe      string    `json:"about_me" db:"about_me"`
	AvatarURL    string    `json:"avatar_url" db:"avatar_url"`
	Skills       []string  `json:"skills" db:"skills"`
	Rating       float64   `json:"rating" db:"rating"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

type Project struct {
	ID          string    `json:"id" db:"id"`
	OwnerID     string    `json:"owner_id" db:"owner_id"`
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description" db:"description"`
	TechStack   []string  `json:"tech_stack" db:"tech_stack"`
	Deadline    time.Time `json:"deadline" db:"deadline"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}
type Application struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	UserID    string    `json:"user_id"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
type Message struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	UserID    string    `json:"user_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}
