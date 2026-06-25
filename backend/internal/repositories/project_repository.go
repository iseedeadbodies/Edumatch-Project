package repositories

import (
	"context"
	"errors"

	"github.com/edumatch/backend/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrProjectNotFound = errors.New("проект не найден")

type ProjectRepository struct {
	db *pgxpool.Pool
}

func NewProjectRepository(db *pgxpool.Pool) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) Create(ctx context.Context, p *models.Project) (string, error) {
	query := `
		INSERT INTO projects (owner_id, title, description, tech_stack, deadline)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	var id string
	err := r.db.QueryRow(ctx, query, p.OwnerID, p.Title, p.Description, p.TechStack, p.Deadline).Scan(&id)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *ProjectRepository) GetByID(ctx context.Context, id string) (*models.Project, error) {
	query := `
		SELECT id, owner_id, title, description, tech_stack, deadline, created_at
		FROM projects
		WHERE id = $1
	`
	row := r.db.QueryRow(ctx, query, id)
	return scanProject(row)
}

func (r *ProjectRepository) List(ctx context.Context, search string, stack string) ([]models.Project, error) {
	query := `
		SELECT id, owner_id, title, description, tech_stack, deadline, created_at
		FROM projects
		WHERE ($1 = '' OR title ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR $2 = ANY(tech_stack))
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query, search, stack)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		p, err := scanProject(rows)
		if err != nil {
			return nil, err
		}
		projects = append(projects, *p)
	}
	return projects, rows.Err()
}

func (r *ProjectRepository) Update(ctx context.Context, p *models.Project) error {
	query := `
		UPDATE projects
		SET title = $1, description = $2, tech_stack = $3, deadline = $4
		WHERE id = $5
	`
	tag, err := r.db.Exec(ctx, query, p.Title, p.Description, p.TechStack, p.Deadline, p.ID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrProjectNotFound
	}
	return nil
}

func (r *ProjectRepository) Delete(ctx context.Context, id string) error {
	tag, err := r.db.Exec(ctx, `DELETE FROM projects WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrProjectNotFound
	}
	return nil
}

func scanProject(row pgx.Row) (*models.Project, error) {
	var p models.Project
	err := row.Scan(&p.ID, &p.OwnerID, &p.Title, &p.Description, &p.TechStack, &p.Deadline, &p.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrProjectNotFound
		}
		return nil, err
	}
	return &p, nil
}
