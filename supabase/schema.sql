-- Supabase Schema for MielCRM (Ferme Agri-Bio)
-- This file needs to be executed in the Supabase SQL Editor

-- 1. Create Tables

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    region TEXT,
    commercial TEXT NOT NULL,
    commandes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commandes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    commercial TEXT NOT NULL,
    qty INTEGER NOT NULL,
    prix INTEGER NOT NULL,
    montant INTEGER NOT NULL,
    statut TEXT NOT NULL CHECK (statut IN ('EN_ATTENTE', 'CONFIRMEE', 'LIVREE', 'ANNULEE')),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    link TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_reps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    zone TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_initials TEXT NOT NULL,
    photo_url TEXT,
    email TEXT,
    role TEXT,
    accent_color TEXT,
    taches_en_cours INTEGER DEFAULT 0,
    activites_commerciales TEXT,
    objectif INTEGER NOT NULL,
    client_ids TEXT[] DEFAULT '{}',
    auth_id UUID REFERENCES auth.users(id)
);

-- No initial sample data. Base is completely empty for production.,
-- Disable Row Level Security temporarily to easily migrate from LocalStorage. 
-- In production, you would enable RLS and add Auth policies.
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE commandes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales_reps DISABLE ROW LEVEL SECURITY;

-- Note for later: Optional realtime functionality
-- To enable realtime dashboards, run this and enable realtime in Supabase for these tables
-- alter publication supabase_realtime add table clients;
-- alter publication supabase_realtime add table commandes;
-- alter publication supabase_realtime add table notifications;
