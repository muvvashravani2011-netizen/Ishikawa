import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, TreeTableModule, ButtonModule, InputTextModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  treeNodes: TreeNode[] = [];

  selectedNode: TreeNode | null = null;
  selectedKeys: { [key: string]: boolean } = {};
  expandedKeys: { [key: string]: boolean } = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<TreeNode[]>(`/data/ishikawa.json`).subscribe({
      next: (nodes) => {
        this.treeNodes = this.ensureLevels(nodes);
        this.expandAllNodes(this.treeNodes);
        //this.expandedKeys = this.buildExpandedKeys(this.treeNodes);
      },
      error: () => {
        // fallback to a default root if asset missing
        this.treeNodes = [
          { key: this.generateKey(), data: { name: 'Missed Deadline', level: 1 }, children: [] }
        ];
        this.expandAllNodes(this.treeNodes);
        this.expandedKeys = this.buildExpandedKeys(this.treeNodes);
      }
    });
  }

  addChild(targetNode: TreeNode | null): void {
    if (!targetNode) {
      return;
    }
    const currentLevel: number = targetNode.data?.level ?? 1;
    if (currentLevel >= 4) {
      return;
    }

    if (!targetNode.children) {
      targetNode.children = [];
    }

    targetNode.children.push({
      key: this.generateKey(),
      data: { name: 'New Item', level: currentLevel + 1 },
      children: []
    });

    // ensure parent shows the newly added child
    (targetNode as any).expanded = true;
    if (targetNode.key) {
      this.expandedKeys[targetNode.key] = true;
    }
    // trigger change detection by creating a new array reference at root
    this.treeNodes = [...this.treeNodes];
  }

  deleteSelected(): void {
    const keys = Object.keys(this.selectedKeys || {});
    if (!keys.length) {
      return;
    }
    const keySet = new Set<string>(keys);
    this.removeNodesByKeys(this.treeNodes, keySet);
    this.selectedKeys = {};
    this.expandedKeys = this.buildExpandedKeys(this.treeNodes);
    this.treeNodes = [...this.treeNodes];
  }

  private removeNode(nodes: TreeNode[], key: string): boolean {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.key === key) {
        nodes.splice(i, 1);
        return true;
      }
      if (node.children && node.children.length) {
        const removed = this.removeNode(node.children, key);
        if (removed) {
          return true;
        }
      }
    }
    return false;
  }

  private removeNodesByKeys(nodes: TreeNode[], keysToDelete: Set<string>): void {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (node.key && keysToDelete.has(node.key)) {
        nodes.splice(i, 1);
        continue;
      }
      if (node.children && node.children.length) {
        this.removeNodesByKeys(node.children, keysToDelete);
      }
    }
  }

  hasAnySelection(): boolean {
    return Object.keys(this.selectedKeys || {}).length > 0;
  }

  private generateKey(): string {
    return Math.random().toString(36).slice(2);
  }

  private ensureLevels(nodes: TreeNode[], level: number = 1): TreeNode[] {
    return nodes.map((n) => ({
      ...n,
      data: { ...(n.data || {}), level },
      children: n.children && n.children.length ? this.ensureLevels(n.children, level + 1) : []
    }));
  }

  private buildExpandedKeys(nodes: TreeNode[]): { [key: string]: boolean } {
    const expanded: { [key: string]: boolean } = {};
    const walk = (arr: TreeNode[]) => {
      for (const node of arr) {
        if (node.key) {
          expanded[node.key] = true;
        }
        if (node.children && node.children.length) {
          walk(node.children);
        }
      }
    };
    walk(nodes);
    return expanded;
  }

  private expandAllNodes(nodes: TreeNode[]): void {
    for (const node of nodes) {
      (node as any).expanded = true;
      if (node.children && node.children.length) {
        this.expandAllNodes(node.children);
      }
    }
  }
}


