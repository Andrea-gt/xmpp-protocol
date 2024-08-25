/**
 * @file FlexBetween.js
 * @description This file exports a styled component called `FlexBetween` using Material-UI's `styled` function.
 *              `FlexBetween` is a styled `Box` component that utilizes CSS Flexbox properties to align 
 *              child elements. It sets the display to "flex", aligns items to the center, and distributes 
 *              space between child elements.
 * 
 *              This utility component can be used to create flexible layouts where items are evenly 
 *              spaced out and aligned vertically.
 * 
 *              Key functionalities provided by this component include:
 *              - Flexbox layout with space distributed between items.
 *              - Vertical alignment of items to the center.
 * 
 * @author Andrea Ximena Ramirez Recinos
 * @created Aug 2024
 * 
 * @note Documentation Generated with ChatGPT
 */

import { Box } from "@mui/material";
import { styled } from "@mui/system";

const FlexBetween = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export default FlexBetween;