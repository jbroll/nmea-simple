/*
 * === GSV - Satellites in view ===
 *
 * ------------------------------------------------------------------------------
 *         1 2 3  4  5  6  7   8  9  10 11  12 13 14 15  16 17 18 19  20 21 22
 *         | | |  |  |  |  |   |  |  |  |   |  |  |  |   |  |  |  |   |  |  |
 *  $--GSV,x,x,xx,xx,xx,xx,xxx,xx,xx,xx,xxx,xx,xx,xx,xxx,xx,xx,xx,xxx,xx,s*hh<CR><LF>
 * ------------------------------------------------------------------------------
 *
 * Field Number:
 *
 * 1. Number of sentences for full data
 * 2. Sentence number out of total
 * 3. Number of satellites in view
 * 4. PRN of satellite used for fix (may be blank)
 *
 * 5. Satellite PRN number     \
 * 6. Elevation, degrees       +- Satellite 1
 * 7. Azimuth, degrees         |
 * 8. Signal to noise ratio    /
 *
 * 9. Satellite PRN number     \
 * 10. Elevation, degrees      +- Satellite 2
 * 11. Azimuth, degrees        |
 * 12. Signal to noise ratio   /
 *
 * 13. Satellite PRN number    \
 * 14. Elevation, degrees      +- Satellite 3
 * 15. Azimuth, degrees        |
 * 16. Signal to noise ratio   /
 *
 * 17. Satellite PRN number    \
 * 18. Elevation, degrees      +- Satellite 4
 * 19. Azimuth, degrees        |
 * 20. Signal to noise ratio   /
 *
 * 21. Signal ID (u-blox specific field, optional):
 *     For GPS (GP):
 *     0: All signals (default if field not present)
 *     1: L1 C/A
 *     6: L2 CL
 * 22. Checksum
 */

import { parseIntSafe } from "../helpers";
import { initStubFields, PacketStub } from "./PacketStub";

export const sentenceId: "GSV" = "GSV";
export const sentenceName = "Satellites in view";

export interface Satellite {
    prnNumber: number;
    elevationDegrees: number;
    azimuthTrue: number;
    SNRdB: number;
}

export interface GSVPacket extends PacketStub<typeof sentenceId> {
    numberOfMessages: number;
    messageNumber: number;
    satellitesInView: number;
    satellites: Satellite[];
    signalId: string;
}

export function decodeSentence(stub: PacketStub, fields: string[]): GSVPacket {
    // Each satellite uses 4 fields
    const numRecords = Math.floor((fields.length - 4) / 4);
    const sats: Satellite[] = [];

    // Process satellite records
    for (let i = 0; i < numRecords; i++) {
        const offset = i * 4 + 4;

        // Only add satellites with valid PRN numbers
        const prn = parseIntSafe(fields[offset]);
        if (prn > 0) {
            sats.push({
                prnNumber: prn,
                elevationDegrees: parseIntSafe(fields[offset + 1]),
                azimuthTrue: parseIntSafe(fields[offset + 2]),
                SNRdB: parseIntSafe(fields[offset + 3])
            });
        }
    }

    // Check for signal ID field
    // If present, it will be after all satellite records but before checksum
    const expectedSatelliteFields = 4 + (numRecords * 4);
    const signalId = fields.length > expectedSatelliteFields ? fields[fields.length - 1] : "0";

    return {
        ...initStubFields(stub, sentenceId, sentenceName),
        numberOfMessages: parseIntSafe(fields[1]),
        messageNumber: parseIntSafe(fields[2]),
        satellitesInView: parseIntSafe(fields[3]),
        satellites: sats,
        signalId
    };
}

