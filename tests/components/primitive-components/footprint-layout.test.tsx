import { test, expect } from "bun:test"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("footprint layout", () => {
  const { circuit } = getTestFixture()

  circuit.add(
    <board width="10mm" height="10mm">
      <chip
        name="U1"
        footprint={
          <footprint>
            <smtpad
              shape="rect"
              width="1mm"
              height="1mm"
              portHints={["pin1"]}
            />
            <smtpad
              shape="rect"
              width="1mm"
              height="1mm"
              portHints={["pin2"]}
            />
            <hole name="H1" diameter="1mm" />
            <constraint pcb edgeToEdge xdist="4mm" left=".pin1" right=".pin2" />
            <constraint
              pcb
              centerToCenter
              xdist="2.5mm"
              left=".pin1"
              right=".H1"
            />
            <constraint centerToCenter ydist="2.5mm" top=".pin1" bottom=".H1" />
          </footprint>
        }
      />
    </board>,
  )

  circuit.render()

  const smtpads = circuit.db.pcb_smtpad.list()

  // center to center distance will be 5mm (4mm plus the half widths of the pads)
  expect(Math.abs(smtpads[0].x - smtpads[1].x)).toBeCloseTo(5, 1)

  // Should be centered about 0
  expect(Math.abs(smtpads[0].x + smtpads[1].x) / 2).toBeCloseTo(0, 1)

  const pcbPorts = circuit.db.pcb_port.list()

  expect(pcbPorts.length).toBe(2)

  expect(pcbPorts[0].x).toBeOneOf([-2.5, 2.5])
  expect(pcbPorts[1].x).toBeOneOf([-2.5, 2.5])

  // Check hole position
  const hole = circuit.db.pcb_hole.list()[0]

  expect(hole.x).toBeCloseTo(0, 1)
  expect(hole.y).toBeCloseTo(-1.25, 1)

  expect(circuit.getCircuitJson()).toMatchPcbSnapshot(import.meta.path)
})