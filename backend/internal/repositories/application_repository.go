package repositories

import (
	"context"
	"errors"

	"github.com/edumatch/backend/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrApplicationNotFound = errors.New("заявка не найдена")
var ErrAlreadyApplied = errors.New("вы уже подали заявку на этот проект")

type ApplicationRepository struct {
	db *pgxpool.Pool
}

func NewApplicationRepository(db *pgxpool.Pool) *ApplicationRepository {
	return &ApplicationRepository{db: db}
}

func (r *ApplicationRepository) Create(ctx context.Context, projectID, userID string) (string, error) {
	query := `
		INSERT INTO applications (project_id, user_id)
		VALUES ($1, $2)
		RETURNING id
	`
	var id string
	err := r.db.QueryRow(ctx, query, projectID, userID).Scan(&id)
	if err != nil {
		if isUniqueViolation(err) {
			return "", ErrAlreadyApplied
		}
		return "", err
	}
	return id, nil
}

func (r *ApplicationRepository) GetByProject(ctx context.Context, projectID string) ([]models.Application, error) {
	query := `
		SELECT id, project_id, user_id, status, created_at
		FROM applications
		WHERE project_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var apps []models.Application
	for rows.Next() {
		var a models.Application
		if err := rows.Scan(&a.ID, &a.ProjectID, &a.UserID, &a.Status, &a.CreatedAt); err != nil {
			return nil, err
		}
		apps = append(apps, a)
	}
	return apps, rows.Err()
}

func (r *ApplicationRepository) GetByUser(ctx context.Context, userID string) ([]models.Application, error) {
	query := `
		SELECT id, project_id, user_id, status, created_at
		FROM applications
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var apps []models.Application
	for rows.Next() {
		var a models.Application
		if err := rows.Scan(&a.ID, &a.ProjectID, &a.UserID, &a.Status, &a.CreatedAt); err != nil {
			return nil, err
		}
		apps = append(apps, a)
	}
	return apps, rows.Err()
}

func (r *ApplicationRepository) UpdateStatus(ctx context.Context, id, status string) error {
	query := `UPDATE applications SET status = $1 WHERE id = $2`
	tag, err := r.db.Exec(ctx, query, status, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrApplicationNotFound
	}
	return nil
}

func (r *ApplicationRepository) GetByID(ctx context.Context, id string) (*models.Application, error) {
	query := `
		SELECT id, project_id, user_id, status, created_at
		FROM applications WHERE id = $1
	`
	var a models.Application
	err := r.db.QueryRow(ctx, query, id).Scan(&a.ID, &a.ProjectID, &a.UserID, &a.Status, &a.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrApplicationNotFound
		}
		return nil, err
	}
	return &a, nil
}

func (r *ApplicationRepository) DeleteByProjectAndUser(ctx context.Context, projectID, userID string) error {
	query := `DELETE FROM applications WHERE project_id = $1 AND user_id = $2`
	tag, err := r.db.Exec(ctx, query, projectID, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrApplicationNotFound
	}
	return nil
}
func (r *ApplicationRepository) GetMembersByProject(ctx context.Context, projectID string) ([]string, error) {
	query := `
		SELECT user_id FROM applications
		WHERE project_id = $1 AND status = 'accepted'
	`
	rows, err := r.db.Query(ctx, query, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var userIDs []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		userIDs = append(userIDs, id)
	}
	return userIDs, rows.Err()
}
