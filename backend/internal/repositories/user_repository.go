package repositories

import (
	"context"
	"errors"

	"github.com/edumatch/backend/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrUserNotFound = errors.New("пользователь не найден")
var ErrEmailTaken = errors.New("email уже используется")

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, u *models.User) (string, error) {
	query := `
		INSERT INTO users (email, password_hash, full_name)
		VALUES ($1, $2, $3)
		RETURNING id
	`
	var id string
	err := r.db.QueryRow(ctx, query, u.Email, u.PasswordHash, u.FullName).Scan(&id)
	if err != nil {
		if isUniqueViolation(err) {
			return "", ErrEmailTaken
		}
		return "", err
	}
	return id, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, full_name, university, course,
		       about_me, avatar_url, skills, rating, created_at
		FROM users
		WHERE email = $1
	`
	row := r.db.QueryRow(ctx, query, email)
	return scanUser(row)
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, full_name, university, course,
		       about_me, avatar_url, skills, rating, created_at
		FROM users
		WHERE id = $1
	`
	row := r.db.QueryRow(ctx, query, id)
	return scanUser(row)
}

func scanUser(row pgx.Row) (*models.User, error) {
	var u models.User
	var university, aboutMe, avatarURL *string
	var course *int
	var rating *float64
	var skills []string

	err := row.Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.FullName,
		&university, &course, &aboutMe, &avatarURL,
		&skills, &rating, &u.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	if university != nil {
		u.University = *university
	}
	if course != nil {
		u.Course = *course
	}
	if aboutMe != nil {
		u.AboutMe = *aboutMe
	}
	if avatarURL != nil {
		u.AvatarURL = *avatarURL
	}
	if rating != nil {
		u.Rating = *rating
	}
	if skills != nil {
		u.Skills = skills
	} else {
		u.Skills = []string{}
	}

	return &u, nil
}

func isUniqueViolation(err error) bool {
	return err != nil && contains(err.Error(), "23505")
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (func() bool {
		for i := 0; i+len(substr) <= len(s); i++ {
			if s[i:i+len(substr)] == substr {
				return true
			}
		}
		return false
	})()
}
func (r *UserRepository) Update(ctx context.Context, u *models.User) error {
	query := `
		UPDATE users
		SET full_name = $1, university = $2, course = $3, about_me = $4, skills = $5
		WHERE id = $6
	`
	_, err := r.db.Exec(ctx, query, u.FullName, u.University, u.Course, u.AboutMe, u.Skills, u.ID)
	return err
}
