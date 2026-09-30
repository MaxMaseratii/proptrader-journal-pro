// Test script to debug colors in browser console
console.log("=== COLOR DEBUG TEST ===");

// Test 1: Check if CSS classes exist
const testDiv = document.createElement('div');
testDiv.className = 'text-green-400';
document.body.appendChild(testDiv);
const computedStyle = window.getComputedStyle(testDiv);
console.log("text-green-400 computed color:", computedStyle.color);

// Test 2: Check if our custom CSS is loaded
testDiv.className = 'force-green';
const customStyle = window.getComputedStyle(testDiv);
console.log("force-green computed color:", customStyle.color);

// Test 3: Test inline style
testDiv.style.color = '#22c55e';
console.log("inline style color:", testDiv.style.color);

// Test 4: Find all elements with text-green-400
const greenElements = document.querySelectorAll('.text-green-400');
console.log("Found", greenElements.length, "elements with text-green-400");
greenElements.forEach((el, i) => {
    const style = window.getComputedStyle(el);
    console.log(`Element ${i}: color = ${style.color}, text = ${el.textContent.substring(0, 50)}`);
});

document.body.removeChild(testDiv);