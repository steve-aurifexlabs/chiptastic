


function Flop2x() {
	return JSON.parse('./digitalBlocks/flop2x.json')
}

function Register(n) {
	var register = {}

	register.unitCell = Flop2x()

	if(n % 2 != 0) {
		throw('n must be even because of power rail flipping')
	}
	register.n = n / 2
	
	register.deltas = []

	return register
}






////////////



var design = {}


// Specification
design.spec = {}
var spec = design.spec

spec.majorType = 'cpu'
spec.isa = 'rv32i'
spec.documents = {
	'isa-spec': 'https://riscv.org/wp-content/uploads/2019/12/riscv-spec-20191213.pdf',
	'isa-spec-local': './spec/riscv-spec-20191213.pdf',
	'isa-annotations': './spec/rv32i-notes.md',
	'manually-extracted-data': './spec/rv32i-values.json',
}
spec.goals = 'A reliable, small riscv cpu with no register file.'
spec.notes = 'Since this is the first design there is no reference for PPA target. The design is for a felxible memory channel.'


// High Level Design / Low Level Design
design.sketch = {}
design.sketch.documents = {
	'datapath': './drawings/top-level.png',
	'timing-paths': './drawing/timing-paths.png'
	'control-table': './drawings/control.png',
	'control-logic1': './drawings/control1.png',
	'control-logic2': './drawings/control2.png',
}


// RTL capture
design.rtl = {}
var cpu = design.rtl

cpu.irReg = Register(32)
cpu.r1Reg = Register(32)
cpu.r2Reg = Register(32)
cpu.pcReg = Register(32)
cpu.aReg = Register(32)
cpu.wReg = Register(32)

cpu.xMux = Mux(3, 32)
cpu.yMux = Mux(8, 32)
cpu.zMux = Mux(7, 32)
cpu.aMux = Mux(5, 32)
cpu.wMux = Mux(5, 32)

cpu.alu = {}
cpu.alu.and = And(32)
cpu.alu.or = Or(32)
cpu.alu.xor = Xor(32)
cpu.alu.add = FullAdd(32)
cpu.alu.subtract = FullSub(32)

cpu.shifter = {}
cpu.shifter.SLL = Shifter('left', 'logical', 32)
cpu.shifter.SRL = Shifter('right', 'logical', 32)
cpu.shifter.SRA = Shifter('right', 'arithmetic', 32)

cpu.immediates.j = BusSplitter(inst.slice, 

cpu.control = {}

var inst = cpu.ir.q

// Connect Elements
connect(inst.slice(0, 3), y.immJ.slice(0, 5))

// Low Level Design


var env = loadTestEnv()
env.test = 'quick-full'

simulate(design)

optimize('logic-synthesis', cpu)


// Place and Route
place(cpu.ir, x, y)

place(cpu.xMux, x + 200, y + 100)
route(cpu.ir.q, cpu.xMux.a0, [x + 100, 'up', cpu.xMux.a0.y, 'right', cpu.xMux.a0.x]) 

route(cpu.ir.q, cpu.yMux.a0, [yMuxLanes[0], 'up', 200, 'right', 200])
place(cpu.yMux)

// Openlane
var openlane = Openlane('https://osseda.aurifexlabs.com/api/', 'steve@aurifexlabs.com')

openlane.run(cpu, openlane.steps.slice(3))

openlane.show()
var firstRun = openlane.pop()

// Optimize
openlane.run(openlane.steps.slice(3, 17))
driveStrength(memory.do[7], 16)
openlane.run(openlane.steps.slice(18))

openlane.showDiff(firstRun)

