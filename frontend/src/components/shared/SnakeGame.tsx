import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trophy, Cpu } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 150;

const SnakeGame: React.FC = () => {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    const gameBoardRef = useRef<HTMLDivElement>(null);
    const touchStart = useRef({ x: 0, y: 0 });

    const generateFood = useCallback(() => {
        const newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
        // Ensure food doesn't spawn on snake
        if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
            return generateFood();
        }
        return newFood;
    }, [snake]);

    const moveSnake = useCallback(() => {
        if (isGameOver || !gameStarted) return;

        setSnake(prevSnake => {
            const newHead = {
                x: prevSnake[0].x + direction.x,
                y: prevSnake[0].y + direction.y,
            };

            // Wall Collision
            if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
                setIsGameOver(true);
                return prevSnake;
            }

            // Self Collision
            if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                setIsGameOver(true);
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            // Food Collision
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(s => s + 10);
                setFood(generateFood());
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [direction, food, isGameOver, gameStarted, generateFood]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': if (direction.y !== 1) setDirection({ x: 0, y: -1 }); break;
                case 'ArrowDown': if (direction.y !== -1) setDirection({ x: 0, y: 1 }); break;
                case 'ArrowLeft': if (direction.x !== 1) setDirection({ x: -1, y: 0 }); break;
                case 'ArrowRight': if (direction.x !== -1) setDirection({ x: 1, y: 0 }); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [direction]);

    useEffect(() => {
        const interval = setInterval(moveSnake, Math.max(80, BASE_SPEED - (score / 2)));
        return () => clearInterval(interval);
    }, [moveSnake, score]);

    useEffect(() => {
        if (score > highScore) setHighScore(score);
    }, [score, highScore]);

    // Touch Controls
    const onTouchStart = (e: React.TouchEvent) => {
        touchStart.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
        const deltaY = e.changedTouches[0].clientY - touchStart.current.y;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > 30) {
                if (deltaX > 0 && direction.x !== -1) setDirection({ x: 1, y: 0 });
                else if (deltaX < 0 && direction.x !== 1) setDirection({ x: -1, y: 0 });
            }
        } else {
            if (Math.abs(deltaY) > 30) {
                if (deltaY > 0 && direction.y !== -1) setDirection({ x: 0, y: 1 });
                else if (deltaY < 0 && direction.y !== 1) setDirection({ x: 0, y: -1 });
            }
        }
    };

    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setIsGameOver(false);
        setScore(0);
        setGameStarted(true);
    };

    return (
        <div
            style={snakeStyles.container}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <div style={snakeStyles.header}>
                <div style={snakeStyles.statBox}>
                    <Cpu size={16} color="#facc15" />
                    <span>{score}</span>
                </div>
                <div style={snakeStyles.statBox}>
                    <Trophy size={16} color="#4ade80" />
                    <span>{highScore}</span>
                </div>
            </div>

            <div style={snakeStyles.board}>
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                    const x = i % GRID_SIZE;
                    const y = Math.floor(i / GRID_SIZE);
                    const isSnake = snake.some(s => s.x === x && s.y === y);
                    const isHead = snake[0].x === x && snake[0].y === y;
                    const isFood = food.x === x && food.y === y;

                    return (
                        <div key={i} style={snakeStyles.cell}>
                            {isHead && (
                                <motion.div
                                    layoutId="snake-head"
                                    style={snakeStyles.snakeHead}
                                />
                            )}
                            {isSnake && !isHead && (
                                <div style={snakeStyles.snakeBody} />
                            )}
                            {isFood && (
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.8, 1, 0.8]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    style={snakeStyles.food}
                                />
                            )}
                        </div>
                    );
                })}

                <AnimatePresence>
                    {(!gameStarted || isGameOver) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={snakeStyles.overlay}
                        >
                            <h2 style={{ color: '#fff', marginBottom: '10px' }}>
                                {isGameOver ? 'Game Over!' : 'Retro Snake'}
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                                {isGameOver ? `Final Score: ${score}` : 'Swipe or use Arrows to control'}
                            </p>
                            <button
                                onClick={resetGame}
                                style={snakeStyles.playBtn}
                            >
                                <Play size={20} fill="#000" /> {isGameOver ? 'Try Again' : 'Start Play'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const snakeStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        gap: '15px',
    },
    header: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
    },
    statBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255,255,255,0.05)',
        padding: '6px 16px',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 'bold' as const,
        border: '1px solid rgba(255,255,255,0.1)',
    },
    board: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        background: '#050505',
        borderRadius: '16px',
        border: '2px solid #222',
        position: 'relative' as const,
        overflow: 'hidden',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
    },
    cell: {
        border: '0.1px solid rgba(255,255,255,0.01)',
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    snakeBody: {
        width: '100%',
        height: '100%',
        background: '#10b981',
        borderRadius: '4px',
        boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
    },
    snakeHead: {
        width: '100%',
        height: '100%',
        background: '#34d399',
        borderRadius: '6px',
        zIndex: 2,
        boxShadow: '0 0 15px rgba(52, 211, 153, 0.8)',
    },
    food: {
        width: '70%',
        height: '70%',
        background: '#ef4444',
        borderRadius: '50%',
        boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)',
    },
    overlay: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backdropFilter: 'blur(4px)',
    },
    playBtn: {
        background: '#facc15',
        color: '#000',
        border: 'none',
        padding: '12px 28px',
        borderRadius: '50px',
        fontWeight: 'bold' as const,
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 10px 20px rgba(250, 204, 21, 0.3)',
    },
};

export default SnakeGame;
