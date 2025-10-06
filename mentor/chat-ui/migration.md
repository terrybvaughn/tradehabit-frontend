# Mentor Chat UI → TradeHabit Integration Migration Guide

## Overview

This document outlines the migration plan for integrating the Mentor chat UI functionality into the main TradeHabit frontend application. The Mentor feature will transition from a standalone Next.js application to a component within the TradeHabit UI.

## Current State (Pre-Migration)

```
tradehabit-frontend/
├── src/                           # Main TradeHabit UI (Vite + React)
│   ├── components/
│   ├── api/
│   └── ...
├── mentor/
│   └── chat-ui/                   # Standalone Next.js app
│       ├── src/
│       │   ├── app/
│       │   │   ├── api/chat/route.ts
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/
│       │   │   ├── Chat.tsx
│       │   │   └── MessageBubble.tsx
│       │   └── lib/
│       │       ├── openai.ts
│       │       └── runAssistant.ts
│       ├── package.json
│       ├── next.config.js
│       └── .env.local
└── package.json
```

## Target State (Post-Migration)

```
tradehabit-frontend/
├── src/
│   ├── components/
│   │   ├── Body/
│   │   ├── Header/
│   │   ├── Layout/
│   │   └── Mentor/                 # NEW: Mentor components
│   │       ├── MentorPanel.tsx     # Main container component
│   │       ├── Chat.tsx            # Migrated from chat-ui
│   │       ├── MessageBubble.tsx   # Migrated from chat-ui
│   │       └── MentorButton.tsx    # NEW: Trigger component
│   ├── lib/
│   │   └── mentor/                 # NEW: Mentor utilities
│   │       ├── openai.ts           # Migrated from chat-ui
│   │       ├── runAssistant.ts     # Migrated from chat-ui
│   │       └── types.ts            # NEW: Mentor-specific types
│   ├── api/
│   │   └── mentor/                 # NEW: Mentor API routes
│   │       └── chat/
│   │           └── route.ts        # Migrated from chat-ui
│   └── ...
├── package.json                    # Updated with Mentor dependencies
└── .env.local                      # Updated with Mentor env vars
```

## Migration Process

### Phase 1: Prepare Main Application

1. **Update Dependencies**
   ```bash
   # Add Mentor-specific dependencies to main package.json
   npm install openai@4.52.0
   ```

2. **Environment Configuration**
   ```bash
   # Add Mentor environment variables to main .env.local
   echo "OPENAI_API_KEY=your_key" >> .env.local
   echo "ASSISTANT_ID=your_assistant_id" >> .env.local
   echo "TOOL_RUNNER_BASE_URL=your_ngrok_url" >> .env.local
   ```

3. **Create Directory Structure**
   ```bash
   mkdir -p src/components/Mentor
   mkdir -p src/lib/mentor
   mkdir -p src/api/mentor/chat
   ```

### Phase 2: Migrate Components

1. **Copy Core Components**
   ```bash
   # Copy and adapt components
   cp mentor/chat-ui/src/components/Chat.tsx src/components/Mentor/
   cp mentor/chat-ui/src/components/MessageBubble.tsx src/components/Mentor/
   ```

2. **Create Integration Components**
   - `MentorPanel.tsx` - Main container with TradeHabit styling
   - `MentorButton.tsx` - Button to open/close Mentor panel
   - Update existing components to use TradeHabit's design system

3. **Adapt Component Imports**
   - Update import paths to use `@/` aliases
   - Replace Next.js specific imports with Vite equivalents
   - Adapt to TradeHabit's component patterns

### Phase 3: Migrate API Routes

1. **Copy API Logic**
   ```bash
   cp mentor/chat-ui/src/app/api/chat/route.ts src/api/mentor/chat/
   ```

2. **Adapt for Vite Environment**
   - Update environment variable access
   - Adapt to Vite's API handling (if using Vite SSR)
   - Or integrate with existing TradeHabit API structure

### Phase 4: Migrate Utilities

1. **Copy Library Files**
   ```bash
   cp mentor/chat-ui/src/lib/openai.ts src/lib/mentor/
   cp mentor/chat-ui/src/lib/runAssistant.ts src/lib/mentor/
   ```

2. **Create Type Definitions**
   - Extract types from components
   - Create `src/lib/mentor/types.ts`
   - Ensure type consistency with TradeHabit patterns

### Phase 5: Integration

1. **Add Mentor to Main Layout**
   - Add Mentor button to header or navigation
   - Integrate Mentor panel into main layout
   - Handle state management for panel open/close

2. **Style Integration**
   - Adapt Mentor components to TradeHabit's CSS modules
   - Ensure consistent styling with main application
   - Handle responsive design

3. **State Management**
   - Integrate with TradeHabit's existing state management
   - Handle Mentor-specific state (thread ID, messages, etc.)

### Phase 6: Testing & Cleanup

1. **Test Integration**
   - Verify Mentor functionality works within TradeHabit
   - Test API endpoints and data flow
   - Ensure no conflicts with existing features

2. **Remove Standalone App**
   ```bash
   rm -rf mentor/chat-ui/
   ```

3. **Update Documentation**
   - Update README files
   - Update deployment instructions
   - Update environment variable documentation

## Key Considerations

### Technical Challenges

1. **Framework Differences**
   - Next.js → Vite: Different build systems and API handling
   - Next.js API routes → Vite API handling or integration with existing backend
   - Next.js environment variables → Vite environment variables

2. **Styling Integration**
   - Adapt Next.js styling to TradeHabit's CSS modules
   - Ensure design consistency
   - Handle responsive design within TradeHabit layout

3. **State Management**
   - Integrate Mentor state with TradeHabit's existing state
   - Handle component lifecycle within main application
   - Manage API calls and error handling

### Design Decisions

1. **Component Architecture**
   - Keep Mentor as a self-contained feature
   - Minimize coupling with main TradeHabit components
   - Use composition over inheritance

2. **API Integration**
   - Maintain Mentor's API structure for consistency
   - Consider integrating with TradeHabit's existing API patterns
   - Handle authentication and authorization

3. **User Experience**
   - Seamless integration with TradeHabit workflow
   - Consistent interaction patterns
   - Proper loading states and error handling

## Dependencies to Add

```json
{
  "dependencies": {
    "openai": "4.52.0"
  }
}
```

## Environment Variables to Add

```env
# Mentor Configuration
OPENAI_API_KEY=your_openai_api_key
ASSISTANT_ID=your_assistant_id
TOOL_RUNNER_BASE_URL=your_tool_runner_url
```

## Testing Checklist

- [ ] Mentor panel opens/closes correctly
- [ ] Chat functionality works within TradeHabit
- [ ] API calls succeed and return expected data
- [ ] Styling is consistent with TradeHabit design
- [ ] Responsive design works on all screen sizes
- [ ] No conflicts with existing TradeHabit features
- [ ] Environment variables are properly configured
- [ ] Error handling works correctly

## Rollback Plan

If issues arise during migration:

1. Keep the original `mentor/chat-ui/` directory until migration is fully tested
2. Maintain separate environment configurations
3. Document any breaking changes
4. Have a clear rollback procedure to revert to standalone app

## Success Criteria

- [ ] Mentor functionality fully integrated into TradeHabit UI
- [ ] No duplicate dependencies or code
- [ ] Consistent user experience
- [ ] Maintainable code structure
- [ ] All tests passing
- [ ] Documentation updated

---

**Note**: This migration should be performed when there's sufficient time for thorough testing and when the Mentor feature is stable and ready for production integration.
