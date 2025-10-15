import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../components/ui/custom-toaster';
import { ProjectProvider } from '../contexts/ProjectContextNew';

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data generators
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+7 999 123-45-67',
  role: 'Manager' as const,
  active: true,
  avatar: null,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  lastLoginAt: null,
  permissions: ['clients:read', 'clients:write'],
};

export const mockClient = {
  id: '1',
  type: 'ООО' as const,
  name: 'Test Company',
  company: 'Test Company LLC',
  contacts: [
    {
      id: '1',
      name: 'John Doe',
      role: 'Manager',
      phone: '+7 999 123-45-67',
      email: 'john@test.com',
      isPrimary: true,
      messengers: {
        whatsapp: '+7 999 123-45-67',
        telegram: '@johndoe',
      },
    },
  ],
  addresses: {
    physical: {
      street: 'Test Street 123',
      city: 'Test City',
      zipCode: '123456',
    },
  },
  preferredChannel: 'Email' as const,
  source: 'Website',
  status: 'client' as const,
  lastActivity: '2023-01-01T00:00:00Z',
  ownerId: '1',
  projectsCount: 2,
  arBalance: 0,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  tags: [],
  documents: [],
  notes: 'Test client',
};

export const mockProject = {
  id: '1',
  clientId: '1',
  title: 'Test Project',
  siteAddress: 'Test Address 123',
  managerId: '1',
  foremanId: '1',
  startDate: '2023-01-01',
  dueDate: '2023-12-31',
  budget: 100000,
  priority: 'medium' as const,
  stage: 'design' as const,
  productionSubStage: 'cutting' as const,
  riskNotes: 'No risks',
  briefComplete: true,
  createdAt: '2023-01-01T00:00:00Z',
  documents: [],
};

// Mock API responses
export const mockApiResponse = <T,>(data: T) => ({
  data,
  message: 'Success',
  success: true,
});

export const mockPaginatedResponse = <T,>(data: T[], page = 1, limit = 20) => ({
  data,
  pagination: {
    page,
    limit,
    total: data.length,
    totalPages: Math.ceil(data.length / limit),
  },
});

// Mock Supabase responses
export const mockSupabaseResponse = <T,>(data: T | null, error: any = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});

// Test helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createMockFile = (name: string, type: string, size: number) => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Mock router
export const mockNavigate = vi.fn();
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'test',
};

// Mock useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useParams: () => ({}),
  };
});

// Mock Supabase
export const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
      remove: vi.fn(),
    })),
  },
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  })),
  removeChannel: vi.fn(),
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
