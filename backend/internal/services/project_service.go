package services

import (
	"context"
	"errors"
	"time"

	"github.com/edumatch/backend/internal/models"
	"github.com/edumatch/backend/internal/repositories"
)

var ErrNotOwner = errors.New("вы не являетесь владельцем этого проекта")

type ProjectService struct {
	projects *repositories.ProjectRepository
}

func NewProjectService(projects *repositories.ProjectRepository) *ProjectService {
	return &ProjectService{projects: projects}
}

func (s *ProjectService) Create(ctx context.Context, ownerID, title, description string, techStack []string, deadline time.Time) (string, error) {
	p := &models.Project{
		OwnerID:     ownerID,
		Title:       title,
		Description: description,
		TechStack:   techStack,
		Deadline:    deadline,
	}
	return s.projects.Create(ctx, p)
}

func (s *ProjectService) List(ctx context.Context, search, stack string) ([]models.Project, error) {
	return s.projects.List(ctx, search, stack)
}

func (s *ProjectService) Get(ctx context.Context, id string) (*models.Project, error) {
	return s.projects.GetByID(ctx, id)
}

func (s *ProjectService) Update(ctx context.Context, id, requesterID, title, description string, techStack []string, deadline time.Time) error {
	existing, err := s.projects.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing.OwnerID != requesterID {
		return ErrNotOwner
	}

	existing.Title = title
	existing.Description = description
	existing.TechStack = techStack
	existing.Deadline = deadline

	return s.projects.Update(ctx, existing)
}

func (s *ProjectService) Delete(ctx context.Context, id, requesterID string) error {
	existing, err := s.projects.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing.OwnerID != requesterID {
		return ErrNotOwner
	}
	return s.projects.Delete(ctx, id)
}
