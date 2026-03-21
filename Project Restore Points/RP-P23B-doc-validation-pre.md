# Restore Point: RP-P23B-doc-validation-pre

**Created:** 2026-03-21  
**Phase:** 23B — Document Upload Validation & Critical RLS Fix  
**Type:** Pre-implementation  
**Baseline:** Phase 23B search fix complete; document upload blocked by RESTRICTIVE RLS policies

## Scope Statement

Convert all 17 RESTRICTIVE INSERT/UPDATE RLS policies to PERMISSIVE across 9 domain tables. No condition logic changes — only policy type modifier.

## Affected Tables

- `missive_keyword` — INSERT, UPDATE
- `rvm_agenda_item` — INSERT, UPDATE
- `rvm_decision` — INSERT, UPDATE
- `rvm_document` — INSERT, UPDATE
- `rvm_document_version` — INSERT
- `rvm_dossier` — INSERT, UPDATE
- `rvm_item` — INSERT, UPDATE
- `rvm_meeting` — INSERT, UPDATE
- `rvm_task` — INSERT, UPDATE

## Root Cause

All INSERT/UPDATE policies were created with `AS RESTRICTIVE`. PostgreSQL requires at least one PERMISSIVE policy to grant access; RESTRICTIVE policies can only narrow existing permissions. Result: all authenticated writes blocked system-wide.

## Governance Constraints

- No SELECT policy changes
- No storage policy changes
- No condition logic changes
- No schema changes
- No trigger changes
