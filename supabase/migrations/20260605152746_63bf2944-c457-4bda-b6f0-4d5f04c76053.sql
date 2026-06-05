
-- handle_new_user só roda como trigger — ninguém precisa executar diretamente
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- is_staff é usada nas policies; basta usuários autenticados e service_role
REVOKE EXECUTE ON FUNCTION public.is_staff() FROM PUBLIC, anon;
