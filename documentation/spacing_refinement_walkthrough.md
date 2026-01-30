
### Layout Refinement: Spacing

**Goal:**
Improve the visual hierarchy and readability of the `SecureProcessor` component by increasing vertical breathing room.

**Changes:**

1.  **Increased Step Separation:**
    Expanded the vertical gap between the main numbered steps (1, 2, 3) to clearly distinguish each phase of the encryption/decryption process.

    ```diff
    - <TabsContent value="encode" className="space-y-8">
    + <TabsContent value="encode" className="space-y-12">
    ```

    *Effect:* Increases gap from 32px to 48px.

2.  **Increased Content Spacing:**
    Added more space between the step titles (e.g., "1. Select Your Secret File") and their respective content (DropZone, options).

    ```diff
    - <motion.div ... className="space-y-4">
    + <motion.div ... className="space-y-6">
    ```

    *Effect:* Increases gap from 16px to 24px.

**Result:**
The interface now feels less cramped, improving the overall user experience and making the step-by-step flow easier to follow.
