CREATE TABLE public.regional_admin_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_scope TEXT NOT NULL CHECK (role_scope IN ('RT', 'RW')),
  kelurahan TEXT NOT NULL,
  rw TEXT NOT NULL,
  rt TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT regional_admin_roles_scope_check CHECK (
    (role_scope = 'RW' AND rt = '') OR
    (role_scope = 'RT' AND rt <> '')
  ),
  CONSTRAINT regional_admin_roles_unique_scope UNIQUE (user_id, role_scope, kelurahan, rw, rt)
);

CREATE INDEX idx_regional_admin_roles_user_id ON public.regional_admin_roles(user_id);
CREATE INDEX idx_regional_admin_roles_area ON public.regional_admin_roles(kelurahan, rw, rt);

ALTER TABLE public.regional_admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own regional admin roles" ON public.regional_admin_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER set_regional_admin_roles_updated_at
BEFORE UPDATE ON public.regional_admin_roles
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
