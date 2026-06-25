package repositories

import (
	"context"

	"github.com/edumatch/backend/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MessageRepository struct {
	db *pgxpool.Pool
}

func NewMessageRepository(db *pgxpool.Pool) *MessageRepository {
	return &MessageRepository{db: db}
}

func (r *MessageRepository) Create(ctx context.Context, projectID, userID, content string) (*models.Message, error) {
	query := `
		INSERT INTO messages (project_id, user_id, content)
		VALUES ($1, $2, $3)
		RETURNING id, project_id, user_id, content, created_at
	`
	var m models.Message
	err := r.db.QueryRow(ctx, query, projectID, userID, content).Scan(
		&m.ID, &m.ProjectID, &m.UserID, &m.Content, &m.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *MessageRepository) GetByProject(ctx context.Context, projectID string) ([]models.Message, error) {
	query := `
		SELECT id, project_id, user_id, content, created_at
		FROM messages
		WHERE project_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.db.Query(ctx, query, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var m models.Message
		if err := rows.Scan(&m.ID, &m.ProjectID, &m.UserID, &m.Content, &m.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}
	return messages, rows.Err()
}
