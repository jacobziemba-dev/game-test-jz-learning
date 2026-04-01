## 2024-04-01 - Canvas UI Contrast and Readability
**Learning:** Canvas-rendered text UI often suffers from low contrast and poor readability compared to DOM-based UI. Opacity values that look okay on dark backgrounds often fail accessibility standards. Additionally, large dynamic numbers (like XP or Currency) rendered via canvas fillText lack browser-native number formatting.
**Action:** Always check alpha values of canvas text for contrast compliance. Proactively apply `.toLocaleString()` to large dynamic numbers drawn on canvas to improve readability.
