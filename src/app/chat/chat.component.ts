import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Step, Option } from './conversation';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ChatComponent implements OnInit {
  currentStep: Step | null = null;  // Inicializamos como null para evitar el error
  conversationHistory: { sender: string; message: string }[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.currentStep = this.chatService.getCurrentStep();
    this.addToHistory('bot', this.currentStep.message);
  }

  selectOption(option: Option) {
    this.addToHistory('user', option.text);
    this.chatService.selectOption(option);
    this.currentStep = this.chatService.getCurrentStep();
    this.addToHistory('bot', this.currentStep.message);
  }

  resetChat() {
    this.chatService.resetConversation();
    this.currentStep = this.chatService.getCurrentStep();
    this.conversationHistory = [];
    this.addToHistory('bot', this.currentStep.message);
  }

  private addToHistory(sender: string, message: string) {
    this.conversationHistory.push({ sender, message });
  }
}

