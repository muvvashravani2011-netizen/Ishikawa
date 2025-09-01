import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient } from '@angular/common/http';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, TreeTableModule, ButtonModule, InputTextModule, CheckboxModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  treeNodes: TreeNode[] = [];

  selectedNode: TreeNode | null = null;
  expandedKeys: { [key: string]: boolean } = {};
  private selectedRefs: Set<TreeNode> = new Set<TreeNode>();

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
    if (this.selectedRefs.size === 0) {
      return;
    }
    this.treeNodes = this.filterOutByRef(this.treeNodes);
    this.selectedRefs.clear();
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

  hasAnySelection(): boolean {
    return Object.values(this.selectedKeys).some((v) => !!v);
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

  private collectAllKeys(nodes: TreeNode[], acc: string[] = []): string[] {
    for (const n of nodes) {
      if (n.key) {
        acc.push(n.key);
      }
      if (n.children && n.children.length) {
        this.collectAllKeys(n.children, acc);
      }
    }
    return acc;
  }

  private filterOutByKeys(nodes: TreeNode[], keysToDelete: Set<string>): TreeNode[] {
    const result: TreeNode[] = [];
    for (const node of nodes) {
      if (node.key && keysToDelete.has(node.key)) {
        continue;
      }
      const newChildren = node.children && node.children.length ? this.filterOutByKeys(node.children, keysToDelete) : [];
      result.push({ ...node, children: newChildren });
    }
    return result;
  }

  private filterOutByRef(nodes: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];
    for (const node of nodes) {
      if (this.selectedRefs.has(node)) {
        continue;
      }
      const newChildren = node.children && node.children.length ? this.filterOutByRef(node.children) : [];
      result.push({ ...node, children: newChildren });
    }
    return result;
  }

  protected isSelected(node: TreeNode | null | undefined): boolean {
    return !!(node && this.selectedRefs.has(node));
  }

  protected toggleSelected(node: TreeNode | null | undefined, checked: boolean): void {
    if (!node) {
      return;
    }
    if (checked) {
      this.selectedRefs.add(node);
    } else {
      this.selectedRefs.delete(node);
    }
  }
}


