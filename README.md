# Project Overview
This project provides tools to visualize complex data structures and dependencies as a node-based graph using React Flow. The goal is to transform intricate code dependencies and data models into an intuitive, visual representation. By rendering nodes and edges, the project simplifies understanding, memorization, and planning of next steps for development. Two main modules are included:

1. Dependency Flow Builder: Visualizes function dependencies and their execution order from an API.
2. Model Builder: Constructs a node-edge model from structured data (e.g., Lindsey data).

Both modules store their output in localStorage for persistence and return data compatible with React Flow.

# How It Helps
## Memorization:
The visual layout (e.g., main nodes with dependencies above/below) creates a mental map of relationships.
Execution order in buildDependencyFlow (e.g., "calls #1") highlights sequence, reducing cognitive load.
## Decision-Making:
Seeing all dependencies or data relations at once reveals gaps or bottlenecks (e.g., missing code in dependencies).
Developers can prioritize next steps, like adding missing implementations or optimizing call order.
## Extensibility:
Both functions store data in localStorage, allowing incremental updates and integration with a React Flow frontend.

# Sample App

## Main Page
![Main Page #1](https://firebasestorage.googleapis.com/v0/b/personal-blog-darmajr.appspot.com/o/project-content%2Fnode-model-ex2.png?alt=media&token=088871e2-3de4-45b9-aa7e-97332e5df6e5)
---
![Main Page #2](https://firebasestorage.googleapis.com/v0/b/personal-blog-darmajr.appspot.com/o/project-content%2Fnode-model-ex3.png?alt=media&token=1242233d-6174-4e16-9ac5-89f9292ee4c6)
---
![Main Page #3](https://firebasestorage.googleapis.com/v0/b/personal-blog-darmajr.appspot.com/o/project-content%2Fnode-model-ex1.png?alt=media&token=c4c61bb1-fc5c-47ff-a5a3-65d599224bd8)

## Setting Page

![Main Page #4](https://firebasestorage.googleapis.com/v0/b/personal-blog-darmajr.appspot.com/o/project-content%2Fnode-model-ex4.png?alt=media&token=fe40130c-709d-40a7-a73b-1769c36f7f01)
---
![Main Page #5](https://firebasestorage.googleapis.com/v0/b/personal-blog-darmajr.appspot.com/o/project-content%2Fnode-model-ex5.png?alt=media&token=10376786-0d28-4ec2-a406-a39a7f37c526)
---
![Main Page #6](https://firebasestorage.googleapis.com/v0/b/personal-blog-darmajr.appspot.com/o/project-content%2Fnode-model-ex6.png?alt=media&token=d9c35e13-7327-404d-8b71-d6d500b1a815)
