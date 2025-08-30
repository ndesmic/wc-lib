# WC-QR-CODE

Creates a QR Code with the payload.

## Props

| name | type | optional | default | description |
|-|-|-|-|-|
| payload | string | no | | Sets the QR Code payload |
| errorlevel | "L" \| "M" \| "Q" \| "H" | no | | Sets the error correction level (per QRCode spec) |
| mask | 0 \| 1 \| 2 \| 3  \| 4 \| 5 \| 6 \| 7 | yes | best-fit | Sets the QR mask
| scale | number | yes | 1 | Sets the node scale (1 node = 1px = 1)