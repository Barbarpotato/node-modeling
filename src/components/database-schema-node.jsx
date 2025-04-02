import React from "react";
import {
  Box,
  Table,
} from "@chakra-ui/react";
import { BaseNode } from "@/components/base-node";

// DatabaseSchemaNodeHeader
export const DatabaseSchemaNodeHeader = ({ children }) => {
  return (
    <Box
      as="h2"
      bg="gray.200"
      p={2}
      textAlign="center"
      fontSize="sm"
      color="gray.500"
      borderTopLeftRadius="md"
      borderTopRightRadius="md"
    >
      {children}
    </Box>
  );
};

// DatabaseSchemaNodeBody
export const DatabaseSchemaNodeBody = ({ children }) => {
  return (
    <>
      <Table.Root
        variant="simple" // Matches 'line' from docs; options: 'simple', 'striped', 'unstyled'
        size="sm" // Options: 'sm', 'md', 'lg'
        sx={{ borderSpacing: "10px" }} // Custom spacing as before
      >
        <Table.Body>{children}</Table.Body>
      </Table.Root>
    </>
  );
};

// DatabaseSchemaTableRow
export const DatabaseSchemaTableRow = ({ children, className }) => {
  return (
    <Table.Row
      position="relative"
      fontSize="xs"
      className={className || ""}
      _hover={{ bg: "gray.50" }} // Adds hover effect (like 'interactive' prop)
    >
      {children}
    </Table.Row>
  );
};

// DatabaseSchemaTableCell
export const DatabaseSchemaTableCell = ({ className, children }) => {
  return <Table.Cell className={className}>{children}</Table.Cell>;
};

// DatabaseSchemaNode
export const DatabaseSchemaNode = ({ className, selected, children }) => {
  return (
    <BaseNode className={className} selected={selected}>
      {children}
    </BaseNode>
  );
};