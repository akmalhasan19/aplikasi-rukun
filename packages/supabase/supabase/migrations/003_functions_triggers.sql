-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger for organizations
CREATE TRIGGER set_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger for transactions
CREATE TRIGGER set_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Function to update organization balance
CREATE OR REPLACE FUNCTION public.update_organization_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.type = 'PEMASUKAN') THEN
      UPDATE public.organizations SET balance = balance + NEW.amount WHERE id = NEW.organization_id;
    ELSIF (NEW.type = 'PENGELUARAN') THEN
      UPDATE public.organizations SET balance = balance - NEW.amount WHERE id = NEW.organization_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
     IF (OLD.type = 'PEMASUKAN') THEN
      UPDATE public.organizations SET balance = balance - OLD.amount WHERE id = OLD.organization_id;
    ELSIF (OLD.type = 'PENGELUARAN') THEN
      UPDATE public.organizations SET balance = balance + OLD.amount WHERE id = OLD.organization_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for balance update
CREATE TRIGGER on_transaction_change
AFTER INSERT OR DELETE ON public.transactions
FOR EACH ROW EXECUTE PROCEDURE public.update_organization_balance();
