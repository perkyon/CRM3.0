import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { Projects } from './Projects';
import { ProjectProvider } from '../../contexts/ProjectContextNew';
import { useUsers } from '../../lib/hooks/useUsers';

// Mock the useUsers hook
vi.mock('../../lib/hooks/useUsers');
const mockUseUsers = useUsers as any;

// Mock the ProjectProvider
vi.mock('../../contexts/ProjectContextNew', () => ({
  ProjectProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useProjects: () => ({
    projects: [],
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn()
  })
}));

// Mock the client store
vi.mock('../../lib/stores/clientStore', () => ({
  useClientStore: () => ({
    clients: []
  })
}));

// Mock analytics
vi.mock('../../lib/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackUserAction: vi.fn()
  })
}));

describe('Projects Component', () => {
  beforeEach(() => {
    mockUseUsers.mockReturnValue({
      users: [
        {
          id: '1',
          name: 'Test Manager',
          email: 'manager@test.com',
          phone: '+7 495 123-45-67',
          role: 'Manager',
          active: true,
          avatar: null
        }
      ],
      loading: false,
      error: null,
      loadUsers: vi.fn(),
      getUsersByRole: vi.fn().mockReturnValue([]),
      getManagers: vi.fn().mockReturnValue([]),
      getAdmins: vi.fn().mockReturnValue([]),
      getManagersAndAdmins: vi.fn().mockReturnValue([])
    });
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <ProjectProvider>
          <Projects />
        </ProjectProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Проекты')).toBeInTheDocument();
  });

  it('shows create project button', () => {
    render(
      <BrowserRouter>
        <ProjectProvider>
          <Projects />
        </ProjectProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Создать проект')).toBeInTheDocument();
  });
});
