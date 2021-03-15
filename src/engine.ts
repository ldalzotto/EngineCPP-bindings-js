
type ArrayBufferOrFunction = ArrayBuffer | ((any: any) => any);

interface IEngineSharedLibrary {
    LoadDynamicLib(p_path: string): void;
    EntryPoint(...p_args: ArrayBuffer[]);
    EntryPointWithFunction(...p_args: ArrayBufferOrFunction[]);
};


let engine: IEngineSharedLibrary = require("../dll/build/Debug/Engine") as IEngineSharedLibrary;
// engine.LoadDynamicLib("lib/EngineDLL.dll");
engine.LoadDynamicLib("E:/GameProjects/GameEngineLinux/cmake-build-debug/api/EngineDLL.dll");


class BufferBuilder {
    array_buffer: ArrayBuffer;

    public static allocate(): BufferBuilder {
        let l_buffer_builder = new BufferBuilder();
        l_buffer_builder.array_buffer = new ArrayBuffer(0);
        return l_buffer_builder;
    };

    public push_int32(p_number: number): BufferBuilder {
        let l_new_buffer = new ArrayBuffer(this.array_buffer.byteLength + 4);

        let l_int8_array = new Int8Array(l_new_buffer);
        l_int8_array.set(new Int8Array(this.array_buffer), 0);
        l_int8_array.set(new Int8Array(Int32Array.of(p_number).buffer), this.array_buffer.byteLength);
        this.array_buffer = l_new_buffer;
        return this;
    };

    public push_float32(p_number: number): BufferBuilder {
        let l_new_buffer = new ArrayBuffer(this.array_buffer.byteLength + 4);

        let l_int8_array = new Int8Array(l_new_buffer);
        l_int8_array.set(new Int8Array(this.array_buffer), 0);
        l_int8_array.set(new Int8Array(Float32Array.of(p_number).buffer), this.array_buffer.byteLength);
        this.array_buffer = l_new_buffer;
        return this;
    };

    public push_string(p_str: string): BufferBuilder {
        let l_new_buffer = new ArrayBuffer(this.array_buffer.byteLength + 8 + p_str.length + 1);

        let l_int8_array = new Int8Array(l_new_buffer);
        l_int8_array.set(new Int8Array(this.array_buffer), 0);
        l_int8_array.set(new Int8Array(Int32Array.of(p_str.length + 1, 0).buffer), this.array_buffer.byteLength);
        l_int8_array.set(new TextEncoder().encode(p_str), this.array_buffer.byteLength + 8);
        this.array_buffer = l_new_buffer;

        return this;
    }
};

export class Token<T>{
    tok: ArrayBuffer;

    static allocate_empty<T>(): Token<T> {
        return { tok: new ArrayBuffer(8) };
    };

    static allocate<T>(p_array_buffer: ArrayBuffer): Token<T> {
        return { tok: p_array_buffer };
    };
};

export class v3f {
    public x: number;
    public y: number;
    public z: number;

    constructor(p_x: number, p_y: number, p_z: number) {
        this.x = p_x;
        this.y = p_y;
        this.z = p_z;
    };

    public to_array_buffer(p_array_buffer_builder: BufferBuilder): BufferBuilder {
        return p_array_buffer_builder.push_float32(this.x).push_float32(this.y).push_float32(this.z);
    };
};

export class quat {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    constructor(p_x: number, p_y: number, p_z: number, p_w: number) {
        this.x = p_x;
        this.y = p_y;
        this.z = p_z;
        this.w = p_w;
    };

    public to_array_buffer(p_array_buffer_builder: BufferBuilder): BufferBuilder {
        return p_array_buffer_builder.push_float32(this.x).push_float32(this.y).push_float32(this.z).push_float32(this.w);
    };

    public static rotate_around(p_axis: v3f, p_angle: number) {
        let l_sin = Math.sin(p_angle * 0.5);
        return new quat(p_axis.x * l_sin, p_axis.y * l_sin, p_axis.z * l_sin, Math.cos(p_angle * 0.5));
    };

    public mul(p_number: number): quat {
        return new quat(this.x * p_number, this.y * p_number, this.z * p_number, this.w * p_number);
    };
};

export class transform {
    public position: v3f;
    public rotation: quat;
    public scale: v3f;

    constructor(p_position: v3f, p_rotation: quat, p_scale: v3f) {
        this.position = p_position;
        this.rotation = p_rotation;
        this.scale = p_scale;
    };

    public to_array_buffer(p_array_buffer_builder: BufferBuilder): BufferBuilder {
        this.position.to_array_buffer(p_array_buffer_builder);
        this.rotation.to_array_buffer(p_array_buffer_builder);
        this.scale.to_array_buffer(p_array_buffer_builder);
        return p_array_buffer_builder;
    };
};

export class CameraComponent {
    near: number;
    far: number;
    fov: number;

    constructor(p_near: number, p_far: number, p_fov: number) {
        this.near = p_near;
        this.far = p_far;
        this.fov = p_fov;
    };

    public to_array_buffer(p_array_buffer_builder: BufferBuilder): BufferBuilder {
        p_array_buffer_builder = p_array_buffer_builder.push_float32(this.near).push_float32(this.far).push_float32(this.fov);
        return p_array_buffer_builder;
    };
};

export interface MeshRendererComponent { };

enum EngineFuncType {
    Undefined = 0,
    SpawnEngine = 1,
    DestroyEngine = 2,
    SpawnEngine_v2 = 3,
    MainLoop = 4,
    CreateNode = 5,
    FrameCount = 6,
    NodeAddCamera = 7,
    NodeAddMeshRenderer = 8,
    RemoveNode = 9,
    NodeAddWorldRotation = 10,
    DeltaTime = 11
};

class EngineFuncKey {
    tok: ArrayBuffer;

    static allocate(p_type: EngineFuncType): EngineFuncKey {
        return { tok: BufferBuilder.allocate().push_int32(p_type).array_buffer };
    };
};

export interface Engine { };
export interface Node { };

export enum EngineExternalStep {
    BEFORE_COLLISION = 0,
    AFTER_COLLISION = BEFORE_COLLISION + 1,
    BEFORE_UPDATE = AFTER_COLLISION + 1,
    END_OF_FRAME = BEFORE_UPDATE + 1
};

export class EngineFunc {
    public static SpawnEngine(p_database_path: string, p_window_width: number, p_window_height: number): Token<Engine> {
        let l_key: EngineFuncKey = EngineFuncKey.allocate(EngineFuncType.SpawnEngine_v2);
        let l_engine: Token<Engine> = Token.allocate_empty<Engine>();
        let l_buffer = BufferBuilder.allocate().push_string(p_database_path).push_int32(p_window_width).push_int32(p_window_height).array_buffer;
        engine.EntryPoint(l_key.tok, l_engine.tok, l_buffer);
        return l_engine;
    };

    public static DestroyEngine(p_engine: Token<Engine>) {
        let l_key: EngineFuncKey = EngineFuncKey.allocate(EngineFuncType.DestroyEngine);
        engine.EntryPoint(l_key.tok, p_engine.tok);
    };

    public static MainLoop(p_engine: Token<Engine>, p_cb: (p_step: EngineExternalStep) => void) {
        let l_key: EngineFuncKey = EngineFuncKey.allocate(EngineFuncType.MainLoop);

        engine.EntryPointWithFunction(l_key.tok, p_engine.tok, (p_buffer: ArrayBuffer) => {
            let l_step = new Int32Array(p_buffer)[0];
            p_cb(l_step);
        });
    };

    public static FrameCount(p_engine: Token<Engine>): number {
        let l_key: EngineFuncKey = EngineFuncKey.allocate(EngineFuncType.FrameCount);


        let l_frame = BufferBuilder.allocate().push_int32(0).push_int32(0);
        engine.EntryPoint(l_key.tok, p_engine.tok, l_frame.array_buffer);

        return new Int32Array(l_frame.array_buffer)[0];
    };

    public static DeltaTime(p_engine: Token<Engine>): number {
        let l_key: EngineFuncKey = EngineFuncKey.allocate(EngineFuncType.DeltaTime);


        let l_delta_time = BufferBuilder.allocate().push_float32(0);
        engine.EntryPoint(l_key.tok, p_engine.tok, l_delta_time.array_buffer);

        return new Float32Array(l_delta_time.array_buffer)[0];
    };

    public static CreateNode(p_engine: Token<Engine>, p_transform: transform): Token<Node> {
        let l_key: EngineFuncKey = EngineFuncKey.allocate(EngineFuncType.CreateNode);

        let l_buffer = p_transform.to_array_buffer(BufferBuilder.allocate()).array_buffer;
        let l_node = Token.allocate_empty<Node>();

        engine.EntryPoint(l_key.tok, p_engine.tok, l_buffer, l_node.tok);

        return l_node;
    };

    public static RemoveNode(p_engine: Token<Engine>, p_node: Token<Node>) {
        let l_key: EngineFuncKey = EngineFuncKey.allocate(EngineFuncType.RemoveNode);
        engine.EntryPoint(l_key.tok, p_engine.tok, p_node.tok);
    };

    public static NodeAddWorldRotation(p_engine: Token<Engine>, p_node: Token<Node>, p_delta_rotation: quat) {
        let l_key: EngineFuncKey = EngineFuncKey.allocate(EngineFuncType.NodeAddWorldRotation);
        let l_buffer = p_delta_rotation.to_array_buffer(BufferBuilder.allocate()).array_buffer;

        engine.EntryPoint(l_key.tok, p_engine.tok, p_node.tok, l_buffer);
    };

    public static NodeAddCamera(p_engine: Token<Engine>, p_node: Token<Node>, p_camera: CameraComponent) {
        let l_key: EngineFuncKey = EngineFuncKey.allocate(EngineFuncType.NodeAddCamera);
        let l_buffer = p_camera.to_array_buffer(BufferBuilder.allocate()).array_buffer;
        engine.EntryPoint(l_key.tok, p_engine.tok, p_node.tok, l_buffer);
    };

    public static NodeAddMeshRenderer(p_engine: Token<Engine>, p_node: Token<Node>, p_material: string, p_mesh: string): Token<MeshRendererComponent> {

        let l_key: EngineFuncKey = EngineFuncKey.allocate(EngineFuncType.NodeAddMeshRenderer);
        let l_buffer = BufferBuilder.allocate().push_string(p_material).push_string(p_mesh).array_buffer;
        let l_mesh_renderer = Token.allocate_empty<MeshRendererComponent>();

        engine.EntryPoint(l_key.tok, p_engine.tok, p_node.tok, l_buffer, l_mesh_renderer.tok);

        return l_mesh_renderer;
    };
};