# Mock Board Question Dashboard Update

This version replaces the old centered modal question view with a full-screen exam dashboard.

## Changes
- Full viewport Mock Board exam experience.
- Large question area for easier reading.
- Fixed top header with exam title and `HH:MM:SS` countdown.
- Left-side Question Navigator.
- Navigator colors:
  - Green = answered
  - White/hollow = unanswered
  - Blue outline = current question
  - If the current question is already answered, it remains green with the blue outline.
- Navigator includes a progress percentage and answered count.
- Clicking any question number jumps directly to that question.
- Previous / Next / Submit controls stay at the bottom.
- Existing localStorage refresh recovery is preserved.
- Existing saved answers are preserved when the browser refreshes accidentally.
