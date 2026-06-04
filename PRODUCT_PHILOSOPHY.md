# PawPal Product Philosophy

## Core Product Identity

PawPal is **NOT**:
- A website
- A dashboard
- A registration system

PawPal **IS**:
- A WhatsApp behavior replacement
- A conversational AI product that lives in chat

## Product Flow

### ❌ Old Flow (Friction-Heavy)
```
Website → Register → View Profile → Use Site
```

### ✅ New Flow (WhatsApp-First)
```
Website → "Start on WhatsApp" → Chat Instantly
```

## Website Purpose

The website acts as a **"landing bridge into WhatsApp"** — not a platform itself.

### Primary Goal
Get users into WhatsApp chat as quickly as possible with minimal friction.

### Single Primary CTA
🟢 **"Chat with PawPal on WhatsApp"**

No competing secondary CTAs that dilute conversion.

## Value Hierarchy

The correct hierarchy is:

1. **Instant value** (chat)
2. **Trust building**
3. **Optional profile layer**

NOT the other way around.

## Key Insight

Users don't need identity before value. They need to:
1. Experience the product immediately
2. Build trust through usage
3. Optionally register later for enhanced features

## Homepage Structure

### 1. Hero Section
- Clear value proposition
- Single WhatsApp CTA
- Language support (English & Indonesian)

### 2. Trust Layer
- AI-powered guidance (not vet replacement)
- Instant responses
- Built for common concerns
- Always recommends vet when needed

### 3. How It Works
- Message PawPal
- Get instant guidance
- Know what to do next

### 4. Examples (Critical for Conversion)
Real use cases users can relate to:
- "My dog is vomiting, what should I do?"
- "Can cats eat tuna?"
- "My puppy is not eating today"
- "Is this rash serious?"

### 5. Why PawPal is Different
Establishes authority by contrasting with current user behavior:
- ❌ Google symptoms → conflicting advice
- ✅ PawPal → structured, calm, safe guidance

### 6. Final CTA
Reinforces the primary action: Open WhatsApp

## What Was Removed

These elements were creating friction:
- ❌ "Register Your Pet" as primary CTA
- ❌ "View Profile" competing CTA
- ❌ Feature-heavy descriptions
- ❌ Over-structured onboarding flow

## Environment Configuration

Set the WhatsApp number in `.env`:
```
NEXT_PUBLIC_WHATSAPP_NUMBER=6281234567890
```

This powers the WhatsApp CTA links throughout the site.
