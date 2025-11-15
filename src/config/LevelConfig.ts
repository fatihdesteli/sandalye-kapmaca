export interface MechanicData {
  mechanicName: string;
  musicDuration: number; // saniye cinsinden
  specialMechanic?: string;
  backgroundColor: string;
}

export const MECHANICS: MechanicData[] = [
  {
    mechanicName: 'Normal',
    musicDuration: 15,
    backgroundColor: '#87CEEB', // Açık mavi
  },
  {
    mechanicName: 'Random Chairs',
    musicDuration: 12,
    specialMechanic: 'randomChairPositions',
    backgroundColor: '#90EE90', // Açık yeşil
  },
  {
    mechanicName: 'Moving Chairs',
    musicDuration: 10,
    specialMechanic: 'movingChairs',
    backgroundColor: '#FFB6C1', // Açık pembe
  },
  {
    mechanicName: 'Teleport Players',
    musicDuration: 8,
    specialMechanic: 'teleportPlayers',
    backgroundColor: '#FFD700', // Altın sarısı
  },
  {
    mechanicName: 'Fake Chairs',
    musicDuration: 6,
    specialMechanic: 'movingChairsWithFakes',
    backgroundColor: '#FF6347', // Kırmızı
  },
];

export const GAME_CONFIG = {
  PLAYER_SPEED: 200,
  BOT_EASY_SPEED: 150,
  BOT_MEDIUM_SPEED: 200,
  BOT_HARD_SPEED: 250,
  CHAIR_RADIUS: 200, // Sandalyelerin daire yarıçapı
};
