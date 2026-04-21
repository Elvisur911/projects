#include <stdio.h>

// Print the array
void printArray(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        printf("[%d] ", arr[i]);
    }
    printf("\n");
}

// Bubble Sort with visualization
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
        printf("Pass %d: ", i + 1);
        printArray(arr, n);
    }
}

int main() {
    int arr[] = {64, 25, 12, 22, 11};
    int n = sizeof(arr) / sizeof(arr[0]);

    printf("Initial:  ");
    printArray(arr, n);
    printf("\n");

    bubbleSort(arr, n);

    printf("\nSorted:   ");
    printArray(arr, n);

    return 0;
}