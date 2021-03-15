let engine = require("./dll/build/Debug/Engine");
// engine.LoadDynamicLib("lib/EngineDLL.dll");
engine.LoadDynamicLib("E:/GameProjects/GameEngineLinux/cmake-build-debug/api/EngineDLL.dll");
console.log(process.pid);

let spawn_engine_2_build_input = function(p_database_path, p_window_width, p_window_height) {
    let l_buffer = new ArrayBuffer(4 + 4 + p_database_path.length + 1 + 4 + 4);
    let l_int8_array = new Int8Array(l_buffer);
    let l_offset = 0;
    l_int8_array.set(new Int8Array(Int32Array.of(l_buffer.byteLength).buffer), l_offset);
    l_offset += 4;
    l_int8_array.set(new Int8Array(Int32Array.of(p_database_path.length).buffer), l_offset);
    l_offset += 4;
    l_int8_array.set(new TextEncoder().encode(p_database_path), l_offset);
    l_offset += p_database_path.length + 1;
    l_int8_array.set(new Int8Array(Int32Array.of(p_window_width).buffer), l_offset);
    l_offset += 4;
    l_int8_array.set(new Int8Array(Int32Array.of(p_window_height).buffer), l_offset);
    return l_buffer;
};

let f_spawn_engine_2 = function(p_database_path, p_window_width, p_window_height) {
    let l_key = new ArrayBuffer(4);
    new Int32Array(l_key).set([3], 0);

    let l_engine_ptr = new ArrayBuffer(8);
    engine.EntryPoint(l_key, l_engine_ptr, spawn_engine_2_build_input(p_database_path, p_window_width, p_window_height));

    return l_engine_ptr;
};

let f_frame_count = function(p_engine) {
    let l_key = new ArrayBuffer(4);
    new Int32Array(l_key).set([6], 0);

    let l_frame = new ArrayBuffer(8);
    engine.EntryPoint(l_key, p_engine, l_frame);

    return new Int32Array(l_frame)[0];
};

let f_create_node = function(p_engine, p_transform) {
    let l_key = new ArrayBuffer(4);
    new Int32Array(l_key).set([5], 0);

    let l_buffer = new ArrayBuffer(4 * (3 + 4 + 3));
    let l_int8_array = new Int8Array(l_buffer);
    let l_offset = 0;
    l_int8_array.set(
        new Int8Array(
            Float32Array.of(p_transform.pos.x, p_transform.pos.y, p_transform.pos.z, p_transform.rot.x, p_transform.rot.y, p_transform.rot.z, p_transform.rot.w, p_transform.scal.x, p_transform.scal.y, p_transform.scal.z).buffer
        ));

    let l_node = new ArrayBuffer(8);

    engine.EntryPoint(l_key, p_engine, l_buffer, l_node);

    return l_node;
};

let f_remove_node = function(p_engine, p_node) {
    let l_key = new ArrayBuffer(4);
    new Int32Array(l_key).set([9], 0);

    engine.EntryPoint(l_key, p_engine, p_node);

    // p_node.set(new Int8Array(0, 0, 0, 0, 0, 0, 0, 0));
};

let f_node_add_camera = function(p_engine, p_node, p_camera) {
    let l_key = new ArrayBuffer(4);
    new Int32Array(l_key).set([7], 0);

    let l_buffer = new ArrayBuffer(4 * (3));
    let l_int8_array = new Int8Array(l_buffer);
    l_int8_array.set(
        new Int8Array(
            Float32Array.of(p_camera.near, p_camera.far, p_camera.fov).buffer
        )
    );

    engine.EntryPoint(l_key, p_engine, p_node, l_buffer);
};

let f_node_add_meshrenderer = function(p_engine, p_node, p_material_str, p_mesh_str) {

    let l_key = new ArrayBuffer(4);
    new Int32Array(l_key).set([8], 0);

    let l_buffer = new ArrayBuffer(4 + p_material_str.length + 1 + 4 + p_mesh_str.length + 1);
    let l_int8_array = new Int8Array(l_buffer);
    let l_offset = 0;

    l_int8_array.set(new Int8Array(Int32Array.of(p_material_str.length).buffer), l_offset);
    l_offset += 4;
    l_int8_array.set(new TextEncoder().encode(p_material_str), l_offset);
    l_offset += p_material_str.length + 1;

    l_int8_array.set(new Int8Array(Int32Array.of(p_mesh_str.length).buffer), l_offset);
    l_offset += 4;
    l_int8_array.set(new TextEncoder().encode(p_mesh_str), l_offset);
    l_offset += p_mesh_str.length + 1;

    let l_mesh_renderer = new ArrayBuffer(8);

    engine.EntryPoint(l_key, p_engine, p_node, l_buffer, l_mesh_renderer);

    return l_mesh_renderer;
};

let f_main_loop = function(p_engine_ptr, p_cb) {
    let l_key = new ArrayBuffer(4);
    new Int32Array(l_key).set([4], 0);

    engine.EntryPointWithFunction(l_key, p_engine_ptr, (p_buffer) => {
        let l_step = new Int32Array(p_buffer)[0];
        p_cb(l_step, p_engine_ptr);
    });
};

let f_destroy_engine = function(p_engine_ptr) {
    let l_key = new ArrayBuffer(4);
    new Int32Array(l_key).set([2], 0);

    engine.EntryPoint(l_key, p_engine_ptr);
};

let l_engine_handle = f_spawn_engine_2("E:/GameProjects/GameEngineLinux/_asset/asset/sandbox/d3renderer_cube/asset.db", 400, 400);

let l_camera_node;
let l_model_node;

f_main_loop(l_engine_handle, (p_step, p_engine) => {
    let l_frame_count = f_frame_count(p_engine);
    console.log(l_frame_count);
    if (l_frame_count == 1) {
        if (p_step == 2) {
            l_camera_node = f_create_node(p_engine, { pos: { x: 0.0, y: 0.0, z: 0.0 }, rot: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 }, scal: { x: 1.0, y: 1.0, z: 1.0 } });
            f_node_add_camera(p_engine, l_camera_node, { near: 1.0, far: 30.0, fov: 45.0 });
            l_model_node = f_create_node(p_engine, { pos: { x: 0.0, y: 0.0, z: 5.0 }, rot: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 }, scal: { x: 1.0, y: 1.0, z: 1.0 } });
            f_node_add_meshrenderer(p_engine, l_model_node, "block_1x1_material.json", "block_1x1.obj");
        }
    } else if (l_frame_count == 10) {
        if (p_step == 2) {
            f_remove_node(p_engine, l_model_node);
        }
    } else if (l_frame_count == 20) {
        if (p_step == 2) {
            l_model_node = f_create_node(p_engine, { pos: { x: 0.0, y: 0.0, z: 5.0 }, rot: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 }, scal: { x: 1.0, y: 1.0, z: 1.0 } });
            f_node_add_meshrenderer(p_engine, l_model_node, "block_1x1_material.json", "block_1x1.obj");
        }
    }
})

f_remove_node(l_engine_handle, l_model_node);
f_remove_node(l_engine_handle, l_camera_node);


f_destroy_engine(l_engine_handle);