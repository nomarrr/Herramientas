import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-brainstorm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brainstorm.component.html',
  styleUrl: './brainstorm.component.css'
})
export class BrainstormComponent {
  @Input() ProjectName: string = '';
  @Input() maxIdeas: number = 5;

  ideas: string[] = [];
  newIdea: string = '';

  // Variables para edición
  editIndex: number | null = null;
  editValue: string = '';

  addIdea() {
    if (this.newIdea.trim() && this.ideas.length < this.maxIdeas) {
      this.ideas.push(this.newIdea.trim());
      this.newIdea = '';
    }
  }

  deleteIdea(index: number) {
    this.ideas.splice(index, 1);
    // Si se elimina la idea que estaba editando, cancela la edición
    if (this.editIndex === index) {
      this.cancelEdit();
    }
  }

  startEdit(index: number) {
    this.editIndex = index;
    this.editValue = this.ideas[index];
  }

  saveEdit(index: number) {
    if (this.editValue.trim()) {
      this.ideas[index] = this.editValue.trim();
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editIndex = null;
    this.editValue = '';
  }
}
