CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_transactions_org ON public.transactions(organization_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);