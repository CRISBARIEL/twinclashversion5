import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type DuelEvent =
  | { type: 'join'; clientId: string; name?: string }
  | { type: 'start'; seed: string; duration: number; levelId: number }
  | { type: 'pair'; clientId: string; pairIndexA: number; pairIndexB: number }
  | { type: 'end'; winnerClientId: string; scoreA: number; scoreB: number }
  | { type: 'exit'; clientId: string };

export class DuelRoom {
  private channel: RealtimeChannel | null = null;
  private roomId: string;
  private onEventCallback?: (event: DuelEvent) => void;

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  join(onEvent: (event: DuelEvent) => void): void {
    this.onEventCallback = onEvent;
    this.channel = supabase.channel(`room:${this.roomId}`, {
      config: { broadcast: { self: true } },
    });

    this.channel
      .on('broadcast', { event: 'duel-event' }, (payload) => {
        if (this.onEventCallback && payload.payload) {
          this.onEventCallback(payload.payload as DuelEvent);
        }
      })
      .subscribe((status) => {
        console.log('[DuelRoom] Subscribe status:', status);
      });
  }

  emit(event: DuelEvent): void {
    if (!this.channel) {
      console.error('[DuelRoom] Channel not initialized');
      return;
    }

    this.channel.send({
      type: 'broadcast',
      event: 'duel-event',
      payload: event,
    });
  }

  leave(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
