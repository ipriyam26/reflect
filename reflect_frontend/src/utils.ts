export function updateProgressBar(percentage: number) {
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
        if (percentage === 100) {
            progressBar.textContent = 'Done!';
        } else {
            progressBar.textContent = `${percentage}%`;
        }
    }
}
