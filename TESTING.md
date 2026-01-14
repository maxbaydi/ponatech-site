# TEST PLAN

## Auth Service

- [ ] POST /auth/register (Validation, DB save)
- [ ] POST /auth/login (JWT emission)
- [ ] POST /auth/refresh (Token rotation)
- [ ] gRPC ValidateToken (Valid/Invalid/Expired)

## Catalog Service

- [ ] POST /brands (Admin only)
- [ ] GET /categories (Tree structure correctness)
- [ ] POST /products (JSONB storage check)
- [ ] GET /products (Filtering by JSONB attributes)
- [ ] DELETE /products (Soft delete check)
- [ ] RBAC Interceptors (Ensure Customers cannot write data)
