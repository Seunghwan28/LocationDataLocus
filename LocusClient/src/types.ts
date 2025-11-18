/**
 * 공통 타입 정의
 */

export interface RoomLabel {
  id: string;
  name: string;
  position: [number, number, number];    // 라벨 표시 위치 (중앙)
  corners: [number, number][];           // [x,z] 네 개
}

export interface RobotPosition {
  x: number;
  z: number;
  timestamp: number;
}
