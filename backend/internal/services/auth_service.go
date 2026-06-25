package services

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/edumatch/backend/internal/models"
	"github.com/edumatch/backend/internal/repositories"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var ErrInvalidCredentials = errors.New("неверный email или пароль")

type AuthService struct {
	users     *repositories.UserRepository
	jwtSecret string
	jwtTTL    time.Duration
}

func NewAuthService(users *repositories.UserRepository, jwtSecret string, jwtTTLHours int) *AuthService {
	return &AuthService{
		users:     users,
		jwtSecret: jwtSecret,
		jwtTTL:    time.Duration(jwtTTLHours) * time.Hour,
	}
}

func (s *AuthService) Register(ctx context.Context, email, password, fullName string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	user := &models.User{
		Email:        email,
		PasswordHash: string(hash),
		FullName:     fullName,
	}
	id, err := s.users.Create(ctx, user)
	if err != nil {
		return "", err
	}
	return s.generateToken(id)
}

func (s *AuthService) Login(ctx context.Context, email, password string) (string, error) {
	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		log.Printf("GetByEmail error: %v", err)
		if errors.Is(err, repositories.ErrUserNotFound) {
			return "", ErrInvalidCredentials
		}
		return "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		log.Printf("bcrypt error: %v", err)
		return "", ErrInvalidCredentials
	}

	return s.generateToken(user.ID)
}

func (s *AuthService) generateToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(s.jwtTTL).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
