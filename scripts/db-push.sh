#!/bin/bash
# Script de migration Supabase — bypass du .env
export DATABASE_URL="postgresql://postgres.cpchfoobvjjigwdkqsgj:Oumartidiani7%40@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
export DIRECT_URL="postgresql://postgres.cpchfoobvjjigwdkqsgj:Oumartidiani7%40@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"

echo "→ Pushing schema to Supabase..."
./node_modules/.bin/prisma db push --schema=prisma/schema.prisma "$@"
