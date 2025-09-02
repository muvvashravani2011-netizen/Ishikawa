import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent implements OnInit {
  treeNodes: TreeNode[] = [];

  selectedNode: TreeNode | null = null;
  private selectedRefs: Set<TreeNode> = new Set<TreeNode>();

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Load static asset (no server, no local storage)
    this.http.get<TreeNode[]>(`/data/ishikawa.json`).subscribe({
      next: (nodes) => {
        this.treeNodes = this.ensureLevels(nodes);
        this.sortTreeByName(this.treeNodes);
        this.expandAllNodes(this.treeNodes);
        this.cdr.detectChanges();
      },
      error: () => {
        // final fallback: single root
        this.treeNodes = [
          { key: this.generateKey(), data: { name: 'Missed Deadline', level: 1 }, children: [] }
        ];
        this.sortTreeByName(this.treeNodes);
        this.expandAllNodes(this.treeNodes);
        this.cdr.detectChanges();
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
    // trigger change detection by creating a new array reference at root
    this.sortTreeByName(this.treeNodes);
    this.treeNodes = [...this.treeNodes];
  }

  deleteSelected(): void {
    if (this.selectedRefs.size === 0) {
      return;
    }
    // Cascading delete: remove selected nodes AND their descendants
    const pruned = this.filterOutByRef(this.treeNodes);
    this.treeNodes = this.ensureLevels(pruned);
    this.sortTreeByName(this.treeNodes);
    this.expandAllNodes(this.treeNodes);
    this.selectedRefs.clear();
    // keep UI expanded via node.expanded flag; expandedKeys binding removed
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
    return this.selectedRefs.size > 0;
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

  private expandAllNodes(nodes: TreeNode[]): void {
    for (const node of nodes) {
      (node as any).expanded = true;
      if (node.children && node.children.length) {
        this.expandAllNodes(node.children);
      }
    }
  }

  private sortTreeByName(nodes: TreeNode[]): void {
    const normalize = (value: unknown): string => {
      const s = (value ?? '').toString();
      return s.toLowerCase();
    };
    const sortArray = (arr: TreeNode[]): void => {
      arr.sort((a, b) => {
        const an = normalize(a?.data?.name);
        const bn = normalize(b?.data?.name);
        if (!an && !bn) return 0;
        if (!an) return 1;
        if (!bn) return -1;
        return an.localeCompare(bn);
      });
    };
    const walk = (arr: TreeNode[]): void => {
      sortArray(arr);
      for (const n of arr) {
        if (n.children && n.children.length) {
          walk(n.children);
        }
      }
    };
    walk(nodes);
  }

  // No persistence (asset-only mode)

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

  // (non-cascading helper removed by request)

  protected isSelected(node: TreeNode | null | undefined): boolean {
    return !!(node && this.selectedRefs.has(node));
  }

  protected toggleSelected(node: TreeNode | null | undefined, checked: boolean): void {
    if (!node) {
      return;
    }
    if (checked) {
      this.selectedRefs.add(node);
      // when a parent is checked, also check all descendants
      if (node.children && node.children.length) {
        this.selectDescendants(node.children);
      }
    } else {
      this.selectedRefs.delete(node);
      // when a parent is unchecked, also uncheck all descendants
      if (node.children && node.children.length) {
        this.deselectDescendants(node.children);
      }
    }
  }

  private deselectDescendants(children: TreeNode[]): void {
    for (const child of children) {
      this.selectedRefs.delete(child);
      if (child.children && child.children.length) {
        this.deselectDescendants(child.children);
      }
    }
  }

  private selectDescendants(children: TreeNode[]): void {
    for (const child of children) {
      this.selectedRefs.add(child);
      if (child.children && child.children.length) {
        this.selectDescendants(child.children);
      }
    }
  }

  // No local storage (asset-only mode)
}


