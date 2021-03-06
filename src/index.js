import React from 'react';
import ReactDOM from 'react-dom';
import { string, array, func } from 'prop-types';
import './index.css';

function Square(props) {
    return (
        <button className={`square${props.winningSquare ? " winning-square" : ""}`} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                winningSquare={this.props.winningSquares && Array.prototype.includes.call(this.props.winningSquares, i)}
            />
        );
    }

    render() {
        const me = this;
        const rows = [0, 1, 2].map((row) => {
            const squares = [0, 1, 2].map((col) => {
                return me.renderSquare(row * 3 + col);
            });

            return (
                <div key={row} className="board-row">
                    {squares}
                </div>
            );
        });

        return (
            <div>
                {rows}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            stepNumber: 0,
            xIsNext: true,
            sortMovesDescending: false
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const winner = calculateWinningSquares(squares) != null;

        // Is the game still on and the square empty?
        if (!winner && !squares[i]) {
            // Then update the board state.
            squares[i] = this.state.xIsNext ? 'X' : 'O';

            this.setState({
                history: history.concat([{
                    squares: squares,
                    position: i
                }]),
                stepNumber: history.length,
                xIsNext: !this.state.xIsNext,
            });
        }
    }

    toggleSortMoves() {
        this.setState({
            sortMovesDescending: !this.state.sortMovesDescending
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        })
    }

    render() {
        const history = this.state.history;
        const stepNumber = this.state.stepNumber;
        const current = history[stepNumber];
        const winningSquares = calculateWinningSquares(current.squares);
        const moves = history.map((step, move) => {
            const moveIsCurrent = stepNumber === move;
            const desc = move ?
                `Go to move #${move}: ${step.squares[step.position]} at position ${step.position % 3 + 1}, ${Math.floor(step.position / 3) + 1}` :
                `Go to game start`;

            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{moveIsCurrent ? <strong>{desc}</strong> : desc}</button>
                </li>
            );
        });

        if (this.state.sortMovesDescending) {
            moves.reverse();
        }

        let status;

        if (winningSquares) {
            // Determine the winner from the first square of the winning squares.
            status = `Winner ${current.squares[winningSquares[0]]}`;
        } else if (history.length === 10) {
            status = `The game is a Draw`;
        } else {
            status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winningSquares={winningSquares}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol reversed={this.state.sortMovesDescending}>{moves}</ol>
                    <input id="sort-moves-checkbox" type="checkbox" name="sort-moves" onClick={() => {this.toggleSortMoves()}} />
                    <label htmlFor="sort-moves-checkbox">Sort moves in descending order</label>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinningSquares(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];

        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return Array.prototype.slice.call(lines[i]);
        }
    }

    return null;
}

Square.defaultProps = {
    value: null,
    onClick: func,
    winningSquare: Boolean
}

Square.propTypes =  {
    value: string,
    onClick: func,
    winningSquare: Boolean
}

Board.defaultProps = {
    squares: [],
    onClick: func,
    winningSquares: Array
}

Board.propTypes = {
    squares: array,
    onClick: func,
    winningSquares: Array
}
