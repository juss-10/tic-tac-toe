const gameplay = {
    board: [...document.querySelectorAll(".cell")].map((element, index) => {
        return {
            mark: null,
            position: index,
            played: false,
            player: null
        };
    }),
    currentPlayer: 1
};

Object.seal(gameplay)

export default gameplay;