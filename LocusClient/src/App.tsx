// // src/App.tsx
// import React, { useState, useEffect } from "react";
// import Floorplan3DView from "./Floorplan3dview";
// import "./App.css";
// import { RoomLabel } from "./types";
// import { isPointInPolygon, useRobotTracking } from "./RobotTracking";

// // WebSocket 서버 URL (환경변수 없으면 기본값 사용)
// const TRACKER_SERVER_URL = "https://d73ec8f31362.ngrok-free.app";

// const App: React.FC = () => {
//   const [activeMode, setActiveMode] = useState<"외출" | "취침" | "시네마">("외출");
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [labels, setLabels] = useState<RoomLabel[]>([]);
//   const [editingLabel, setEditingLabel] = useState<string | null>(null);
//   const [selectedLabel, setSelectedLabel] = useState<RoomLabel | null>(null);

//   // 🔎 로봇 상태 패널 표시 여부 (로그 보기 버튼으로 토글)
//   const [showRobotPanel, setShowRobotPanel] = useState(false);

//   // GPS 품질 상태
//   const [gpsQuality, setGpsQuality] = useState<string>("");

//   // 4점 클릭 모드를 위한 상태
//   const [clickedCorners, setClickedCorners] = useState<[number, number][]>([]);

//   // 로봇 위치 및 추적 상태
//   const [robotCurrentRoom, setRobotCurrentRoom] = useState<string | null>(null);

//   const {
//     robotPosition,
//     isConnected: isTrackerConnected,
//     lastUpdate,
//     accuracy,
//     connect,
//     disconnect,
//   } = useRobotTracking({
//     serverUrl: TRACKER_SERVER_URL,
//     autoConnect: true,
//     onError: (e) => {
//       console.error("로봇 트래커 WebSocket 오류:", e);
//     },
//   });

//   // 🔍 최근 업데이트 기준 온라인 판정 (3초 이내)
//   const isRobotOnline =
//     robotPosition !== null &&
//     lastUpdate !== null &&
//     Date.now() - lastUpdate.getTime() < 3000;

//   const accuracyText =
//     accuracy && isRobotOnline ? `±${accuracy.toFixed(3)}` : "±0.000";

//   const lastUpdateText =
//     lastUpdate && isRobotOnline
//       ? lastUpdate.toLocaleTimeString("ko-KR", { hour12: false })
//       : "-";

//   // GPS 품질 평가 (accuracy 값이 변경될 때마다)
//   useEffect(() => {
//     if (!accuracy) {
//       setGpsQuality("-");
//       return;
//     }

//     let quality = "";
//     if (accuracy <= 5) {
//       quality = "🟢 매우 좋음";
//     } else if (accuracy <= 10) {
//       quality = "🟡 좋음";
//     } else if (accuracy <= 20) {
//       quality = "🟠 보통";
//     } else {
//       quality = "🔴 나쁨";
//     }
//     setGpsQuality(quality);
//   }, [accuracy]);

//   // 라벨 추가 (4번 클릭으로 사각형 정의)
//   const handleAddLabel = (position: [number, number, number]) => {
//     const newCorner: [number, number] = [position[0], position[2]];
//     const updatedCorners = [...clickedCorners, newCorner];

//     if (updatedCorners.length < 4) {
//       // 4개 미만: 코너 추가만
//       setClickedCorners(updatedCorners);
//     } else {
//       // 4번째 클릭: 구역 완성
//       const name = prompt("구역 이름을 입력하세요:");
//       if (name) {
//         // 중심점 계산
//         const centerX = updatedCorners.reduce((sum, c) => sum + c[0], 0) / 4;
//         const centerZ = updatedCorners.reduce((sum, c) => sum + c[1], 0) / 4;

//         const newLabel: RoomLabel = {
//           id: Date.now().toString(),
//           name,
//           position: [centerX, 0.5, centerZ],
//           corners: updatedCorners,
//         };
//         setLabels((prev) => [...prev, newLabel]);
//       }
//       setClickedCorners([]); // 초기화
//     }
//   };

//   // 라벨 수정/보기
//   const handleEditLabel = (id: string) => {
//     const label = labels.find((l) => l.id === id);
//     if (label) {
//       if (isEditMode) {
//         // 편집 모드: 이름 수정
//         const newName = prompt("방 이름을 수정하세요:", label.name);
//         if (newName !== null && newName !== "") {
//           setLabels(labels.map((l) => (l.id === id ? { ...l, name: newName } : l)));
//         }
//       } else {
//         // 일반 모드: 정보 표시
//         setSelectedLabel(label);
//       }
//     }
//   };

//   // 라벨 삭제
//   const handleDeleteLabel = (id: string) => {
//     if (confirm("이 라벨을 삭제하시겠습니까?")) {
//       setLabels(labels.filter((l) => l.id !== id));
//     }
//   };

//   // 로봇 위치로 현재 구역 찾기 (Point-in-Polygon)
//   const findRoomByPosition = (
//     robotX: number,
//     robotZ: number
//   ): RoomLabel | null => {
//     return (
//       labels.find((label) => {
//         return isPointInPolygon(robotX, robotZ, label.corners);
//       }) || null
//     );
//   };

//   // 로봇 위치가 바뀔 때마다 현재 방 계산
//   useEffect(() => {
//     if (!robotPosition) {
//       setRobotCurrentRoom(null);
//       return;
//     }

//     const [x, , z] = robotPosition;
//     const room = findRoomByPosition(x, z);
//     setRobotCurrentRoom(room ? room.name : null);
//   }, [robotPosition, labels]);

//   // ★ 선택된 라벨 패널이 떠 있을 때는 라벨을 숨김
//   const displayedLabels = selectedLabel && !isEditMode ? [] : labels;

//   return (
//     <div className="app-container">
//       {/* 상단 헤더 */}
//       <header className="header">
//         <div className="header-left">
//           <h1>우리집</h1>
//           <button className="dropdown-btn">▼</button>
//         </div>
//         <div className="header-right">
//           <button
//             className={`icon-btn ${isEditMode ? "edit-active" : ""}`}
//             onClick={() => setIsEditMode(!isEditMode)}
//             title="구역 편집"
//           >
//             ✏️
//           </button>
//           <button className="icon-btn">+</button>
//           <button className="icon-btn">🔔</button>
//           <button className="icon-btn">⋮</button>
//         </div>
//       </header>

//       {/* 탭 메뉴 */}
//       <nav className="tab-menu">
//         <button className="tab active">🏠 홈</button>
//       </nav>

//       {/* 편집 모드 안내 */}
//       {isEditMode && (
//         <div className="edit-mode-banner">
//           {clickedCorners.length === 0 && (
//             <span>📍 코너 1을 클릭하세요 (1/4)</span>
//           )}
//           {clickedCorners.length === 1 && (
//             <span>
//               📍 코너 2를 클릭하세요 (2/4) |{" "}
//               <button
//                 onClick={() => setClickedCorners([])}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   color: "white",
//                   textDecoration: "underline",
//                   cursor: "pointer",
//                 }}
//               >
//                 취소
//               </button>
//             </span>
//           )}
//           {clickedCorners.length === 2 && (
//             <span>
//               📍 코너 3을 클릭하세요 (3/4) |{" "}
//               <button
//                 onClick={() => setClickedCorners([])}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   color: "white",
//                   textDecoration: "underline",
//                   cursor: "pointer",
//                 }}
//               >
//                 취소
//               </button>
//             </span>
//           )}
//           {clickedCorners.length === 3 && (
//             <span>
//               📍 코너 4를 클릭하세요 (4/4) |{" "}
//               <button
//                 onClick={() => setClickedCorners([])}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   color: "white",
//                   textDecoration: "underline",
//                   cursor: "pointer",
//                 }}
//               >
//                 취소
//               </button>
//             </span>
//           )}
//         </div>
//       )}

//       {/* 3D 뷰어 컨테이너 */}
//       <div className="viewer-container">
//         <Floorplan3DView
//           isEditMode={isEditMode}
//           labels={displayedLabels}
//           onAddLabel={handleAddLabel}
//           onEditLabel={handleEditLabel}
//           onDeleteLabel={handleDeleteLabel}
//           clickedCorners={clickedCorners}
//           // 로봇 관련
//           robotPosition={robotPosition}
//           robotCurrentRoom={robotCurrentRoom}
//         />

//         {/* 로봇 상태 패널 : showRobotPanel이 true일 때만 표시 */}
//         {showRobotPanel && (
//           <div className="robot-status-panel">
//             <div className="robot-status-header">
//               <span
//                 className="robot-status-dot"
//                 data-online={isRobotOnline}
//               />
//               <span className="robot-status-title">
//                 {isRobotOnline ? "실시간 추적 중" : "연결 끊김"}
//               </span>
//             </div>
//             <div className="robot-status-row">
//               <span className="robot-status-label">현재 위치</span>
//               <span className="robot-status-value">
//                 {isRobotOnline
//                   ? robotCurrentRoom ?? (robotPosition ? "구역 밖" : "-")
//                   : "-"}
//               </span>
//             </div>
//             <div className="robot-status-row">
//               <span className="robot-status-label">정확도</span>
//               <span className="robot-status-value">{accuracyText}</span>
//             </div>
//             {/* GPS 품질 표시 */}
//             <div className="robot-status-row">
//               <span className="robot-status-label">위치 품질</span>
//               <span className="robot-status-value">{gpsQuality}</span>
//             </div>
//             <div className="robot-status-row">
//               <span className="robot-status-label">마지막 업데이트</span>
//               <span className="robot-status-value">{lastUpdateText}</span>
//             </div>
//           </div>
//         )}

//         {/* 선택된 라벨 정보 패널 */}
//         {selectedLabel && !isEditMode && (
//           <div className="label-info-panel">
//             <div className="label-info-header">
//               <h3>📍 {selectedLabel.name}</h3>
//               <button
//                 className="close-btn"
//                 onClick={() => setSelectedLabel(null)}
//               >
//                 ✕
//               </button>
//             </div>
//             <div className="label-info-content">
//               <div className="info-row">
//                 <span className="info-label">좌표 범위</span>
//               </div>
//               <div className="coordinates-grid">
//                 {selectedLabel.corners.map((corner, idx) => (
//                   <div key={idx} className="coordinate-item">
//                     <span className="corner-number">{idx + 1}번</span>
//                     <span className="coordinate-value">
//                       ({corner[0].toFixed(2)}, {corner[1].toFixed(2)})
//                     </span>
//                   </div>
//                 ))}
//               </div>
//               <div className="info-row">
//                 <span className="info-label">중심점</span>
//                 <span className="info-value">
//                   ({selectedLabel.position[0].toFixed(2)},{" "}
//                   {selectedLabel.position[2].toFixed(2)})
//                 </span>
//               </div>
//               <div className="info-row">
//                 <span className="info-label">구역 ID</span>
//                 <span className="info-value">{selectedLabel.id}</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* 모드 선택 + 로그 보기 버튼 */}
//       <div className="mode-selector">
//         <button
//           className={`mode-btn ${activeMode === "외출" ? "active" : ""}`}
//           onClick={() => setActiveMode("외출")}
//         >
//           🚶 외출 모드
//         </button>
//         <button
//           className={`mode-btn ${activeMode === "취침" ? "active" : ""}`}
//           onClick={() => setActiveMode("취침")}
//         >
//           🌙 취침 모드
//         </button>
//         <button
//           className={`mode-btn ${activeMode === "시네마" ? "active" : ""}`}
//           onClick={() => setActiveMode("시네마")}
//         >
//           ▶️ 시네마
//         </button>
//         {/* 👉 여기서 로봇 상태 패널 토글 */}
//         <button
//           className={`mode-btn ${showRobotPanel ? "active" : ""}`}
//           onClick={() => setShowRobotPanel((prev) => !prev)}
//         >
//           📜 로그 보기
//         </button>
//       </div>

//       {/* 하단 네비게이션 */}
//       <nav className="bottom-nav">
//         <button className="nav-btn active">
//           <span className="nav-icon">🏠</span>
//           <span className="nav-label">홈</span>
//         </button>
//         <button className="nav-btn">
//           <span className="nav-icon">🧭</span>
//           <span className="nav-label">디스커버</span>
//         </button>
//         <button className="nav-btn">
//           <span className="nav-icon">🏛️</span>
//           <span className="nav-label">리포트</span>
//         </button>
//         <button className="nav-btn">
//           <span className="nav-icon">☰</span>
//           <span className="nav-label">메뉴</span>
//         </button>
//       </nav>
//     </div>
//   );
// };

// export default App;


// src/App.tsx
import React, { useState, useEffect, useMemo } from "react";
import Floorplan3DView from "./Floorplan3dview";
import "./App.css";
import { RoomLabel } from "./types";
import { isPointInPolygon, useRobotTracking } from "./RobotTracking";

// WebSocket 서버 URL
const TRACKER_SERVER_URL = "https://0bde82b33c1c.ngrok-free.app";

// ===== 로봇 좌표 보정용 상수들 =====

// 센서 좌표를 플로어플랜 좌표에 맞게 스케일링
const POS_SCALE = 0.5;

// 센서 기준이 지도보다 몇 도 돌아가 있는지 (실제 움직임 보고 조정)
const ROTATE_DEG = 225; // 90, -90, 180 이런 식으로 바꿔보면 됨
const ROTATE_RAD = (ROTATE_DEG * Math.PI) / 180;

// 화면에서 전체적으로 약간 이동하고 싶으면 여기 수정
const OFFSET_X = 0.3; // +면 오른쪽, -면 왼쪽
const OFFSET_Z = 1.5; // +면 아래쪽, -면 위쪽

function calibrateRobotPosition(
  pos: [number, number, number] | null
): [number, number, number] | null {
  if (!pos) return null;
  let [x, y, z] = pos;

  // 1) 스케일 조정
  x *= POS_SCALE;
  z *= POS_SCALE;

  // 2) Y축 기준 회전
  const cos = Math.cos(ROTATE_RAD);
  const sin = Math.sin(ROTATE_RAD);
  const rx = x * cos - z * sin;
  const rz = x * sin + z * cos;

  // 3) 오프셋
  return [rx + OFFSET_X, y, rz + OFFSET_Z];
}

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<"외출" | "취침" | "시네마">("외출");
  const [isEditMode, setIsEditMode] = useState(false);
  const [labels, setLabels] = useState<RoomLabel[]>([]);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<RoomLabel | null>(null);

    // 🔎 로봇 상태 패널 표시 여부 (로그 보기 버튼으로 토글)
  const [showRobotPanel, setShowRobotPanel] = useState(false);

  // GPS 품질 상태
  const [gpsQuality, setGpsQuality] = useState<string>("");

  // 4점 클릭 모드
  const [clickedCorners, setClickedCorners] = useState<[number, number][]>([]);

  // 로봇 현재 구역
  const [robotCurrentRoom, setRobotCurrentRoom] = useState<string | null>(null);

  // WebSocket 추적 훅 (raw 좌표는 rawRobotPosition 이름으로 받음)
  const {
    robotPosition: rawRobotPosition,
    isConnected: isTrackerConnected,
    lastUpdate,
    accuracy,
    connect,
    disconnect,
  } = useRobotTracking({
    serverUrl: TRACKER_SERVER_URL,
    autoConnect: true,
    onError: (e) => {
      console.error("로봇 트래커 WebSocket 오류:", e);
    },
  });

  // ✅ 여기서 센서 좌표 → 플로어플랜 좌표로 보정
  const calibratedRobotPosition = useMemo(
    () => calibrateRobotPosition(rawRobotPosition),
    [rawRobotPosition]
  );

  // 🔍 최근 업데이트 기준 온라인 판정 (3초 이내)
  const isRobotOnline =
    calibratedRobotPosition !== null &&
    lastUpdate !== null &&
    Date.now() - lastUpdate.getTime() < 3000;

  const accuracyText =
    accuracy && isRobotOnline ? `±${accuracy.toFixed(3)}` : "±0.000";

  const lastUpdateText =
    lastUpdate && isRobotOnline
      ? lastUpdate.toLocaleTimeString("ko-KR", { hour12: false })
      : "-";

  // GPS 품질 평가
  useEffect(() => {
    if (!accuracy) {
      setGpsQuality("-");
      return;
    }

    let quality = "";
    if (accuracy <= 5) {
      quality = "🟢 매우 좋음";
    } else if (accuracy <= 10) {
      quality = "🟡 좋음";
    } else if (accuracy <= 20) {
      quality = "🟠 보통";
    } else {
      quality = "🔴 나쁨";
    }
    setGpsQuality(quality);
  }, [accuracy]);

  // 라벨 추가 (4번 클릭으로 사각형 정의)
  const handleAddLabel = (position: [number, number, number]) => {
    const newCorner: [number, number] = [position[0], position[2]];
    const updatedCorners = [...clickedCorners, newCorner];

    if (updatedCorners.length < 4) {
      setClickedCorners(updatedCorners);
    } else {
      const name = prompt("구역 이름을 입력하세요:");
      if (name) {
        const centerX = updatedCorners.reduce((sum, c) => sum + c[0], 0) / 4;
        const centerZ = updatedCorners.reduce((sum, c) => sum + c[1], 0) / 4;

        const newLabel: RoomLabel = {
          id: Date.now().toString(),
          name,
          position: [centerX, 0.5, centerZ],
          corners: updatedCorners,
        };
        setLabels((prev) => [...prev, newLabel]);
      }
      setClickedCorners([]);
    }
  };

  // 라벨 수정/보기
  const handleEditLabel = (id: string) => {
    const label = labels.find((l) => l.id === id);
    if (label) {
      if (isEditMode) {
        const newName = prompt("방 이름을 수정하세요:", label.name);
        if (newName !== null && newName !== "") {
          setLabels(labels.map((l) => (l.id === id ? { ...l, name: newName } : l)));
        }
      } else {
        setSelectedLabel(label);
      }
    }
  };

  // 라벨 삭제
  const handleDeleteLabel = (id: string) => {
    if (confirm("이 라벨을 삭제하시겠습니까?")) {
      setLabels(labels.filter((l) => l.id !== id));
    }
  };

  // 로봇 위치로 현재 구역 찾기
  const findRoomByPosition = (robotX: number, robotZ: number): RoomLabel | null => {
    return (
      labels.find((label) => {
        return isPointInPolygon(robotX, robotZ, label.corners);
      }) || null
    );
  };

  // 로봇 위치가 바뀔 때마다 현재 방 계산 (✅ 보정된 좌표 기준)
  useEffect(() => {
    if (!calibratedRobotPosition) {
      setRobotCurrentRoom(null);
      return;
    }

    const [x, , z] = calibratedRobotPosition;
    const room = findRoomByPosition(x, z);
    setRobotCurrentRoom(room ? room.name : null);
  }, [calibratedRobotPosition, labels]);

  // 선택된 라벨 패널이 떠 있을 때는 라벨 숨김
  const displayedLabels = selectedLabel && !isEditMode ? [] : labels;

  return (
    <div className="app-container">
      {/* 상단 헤더 */}
      <header className="header">
        <div className="header-left">
          <h1>우리집</h1>
          <button className="dropdown-btn">▼</button>
        </div>
        <div className="header-right">
          <button
            className={`icon-btn ${isEditMode ? "edit-active" : ""}`}
            onClick={() => setIsEditMode(!isEditMode)}
            title="구역 편집"
          >
            ✏️
          </button>
          <button className="icon-btn">+</button>
          <button className="icon-btn">🔔</button>
          <button className="icon-btn">⋮</button>
        </div>
      </header>

      {/* 탭 메뉴 */}
      <nav className="tab-menu">
        <button className="tab active">🏠 홈</button>
      </nav>

      {/* 편집 모드 안내 */}
      {isEditMode && (
        <div className="edit-mode-banner">
          {clickedCorners.length === 0 && (
            <span>📍 코너 1을 클릭하세요 (1/4)</span>
          )}
          {clickedCorners.length === 1 && (
            <span>
              📍 코너 2를 클릭하세요 (2/4) |{" "}
              <button
                onClick={() => setClickedCorners([])}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
            </span>
          )}
          {clickedCorners.length === 2 && (
            <span>
              📍 코너 3을 클릭하세요 (3/4) |{" "}
              <button
                onClick={() => setClickedCorners([])}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
            </span>
          )}
          {clickedCorners.length === 3 && (
            <span>
              📍 코너 4를 클릭하세요 (4/4) |{" "}
              <button
                onClick={() => setClickedCorners([])}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
            </span>
          )}
        </div>
      )}

      {/* 3D 뷰어 컨테이너 */}
      <div className="viewer-container">
        <Floorplan3DView
          isEditMode={isEditMode}
          labels={displayedLabels}
          onAddLabel={handleAddLabel}
          onEditLabel={handleEditLabel}
          onDeleteLabel={handleDeleteLabel}
          clickedCorners={clickedCorners}
          robotPosition={calibratedRobotPosition}   // ✅ 보정된 좌표 전달
          robotCurrentRoom={robotCurrentRoom}
        />

        {/* 로봇 상태 패널 : showRobotPanel이 true일 때만 표시 */}
        {showRobotPanel && (
          <div className="robot-status-panel">
            <div className="robot-status-header">
              <span
                className="robot-status-dot"
                data-online={isRobotOnline}
              />
              <span className="robot-status-title">
                {isRobotOnline ? "실시간 추적 중" : "연결 끊김"}
              </span>
            </div>
            <div className="robot-status-row">
              <span className="robot-status-label">현재 위치</span>
              <span className="robot-status-value">
                {isRobotOnline
                  ? robotCurrentRoom ?? (rawRobotPosition ? "구역 밖" : "-")
                  : "-"}
              </span>
            </div>
            <div className="robot-status-row">
              <span className="robot-status-label">정확도</span>
              <span className="robot-status-value">{accuracyText}</span>
            </div>
            {/* GPS 품질 표시 */}
            <div className="robot-status-row">
              <span className="robot-status-label">위치 품질</span>
              <span className="robot-status-value">{gpsQuality}</span>
            </div>
            <div className="robot-status-row">
              <span className="robot-status-label">마지막 업데이트</span>
              <span className="robot-status-value">{lastUpdateText}</span>
            </div>
          </div>
        )}

        {/* 선택된 라벨 정보 패널 */}
        {selectedLabel && !isEditMode && (
          <div className="label-info-panel">
            <div className="label-info-header">
              <h3>📍 {selectedLabel.name}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedLabel(null)}
              >
                ✕
              </button>
            </div>
            <div className="label-info-content">
              <div className="info-row">
                <span className="info-label">좌표 범위</span>
              </div>
              <div className="coordinates-grid">
                {selectedLabel.corners.map((corner, idx) => (
                  <div key={idx} className="coordinate-item">
                    <span className="corner-number">{idx + 1}번</span>
                    <span className="coordinate-value">
                      ({corner[0].toFixed(2)}, {corner[1].toFixed(2)})
                    </span>
                  </div>
                ))}
              </div>
              <div className="info-row">
                <span className="info-label">중심점</span>
                <span className="info-value">
                  ({selectedLabel.position[0].toFixed(2)},{" "}
                  {selectedLabel.position[2].toFixed(2)})
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">구역 ID</span>
                <span className="info-value">{selectedLabel.id}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 모드 선택 */}
      <div className="mode-selector">
        <button
          className={`mode-btn ${activeMode === "외출" ? "active" : ""}`}
          onClick={() => setActiveMode("외출")}
        >
          🚶 외출 모드
        </button>
        <button
          className={`mode-btn ${activeMode === "취침" ? "active" : ""}`}
          onClick={() => setActiveMode("취침")}
        >
          🌙 취침 모드
        </button>
        <button
          className={`mode-btn ${activeMode === "시네마" ? "active" : ""}`}
          onClick={() => setActiveMode("시네마")}
        >
          ▶️ 시네마
        </button>
        {/* 👉 여기서 로봇 상태 패널 토글 */}
        <button
          className={`mode-btn ${showRobotPanel ? "active" : ""}`}
          onClick={() => setShowRobotPanel((prev) => !prev)}
        >
          📜 로그 보기
        </button>
      </div>

      {/* 하단 네비게이션 */}
      <nav className="bottom-nav">
        <button className="nav-btn active">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">홈</span>
        </button>
        <button className="nav-btn">
          <span className="nav-icon">🧭</span>
          <span className="nav-label">디스커버</span>
        </button>
        <button className="nav-btn">
          <span className="nav-icon">🏛️</span>
          <span className="nav-label">리포트</span>
        </button>
        <button className="nav-btn">
          <span className="nav-icon">☰</span>
          <span className="nav-label">메뉴</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
