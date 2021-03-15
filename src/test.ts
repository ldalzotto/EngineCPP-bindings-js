import {EngineExternalStep, Token, Engine, Node, CameraComponent, transform, v3f, quat, EngineFunc as e} from "./engine.js"

console.log(process.pid);

export class EngineTest {
    l_engine: Token<Engine>;
    l_camera_node: Token<Node>;
    l_model_node: Token<Node>;

    public start() {
        this.l_engine = e.SpawnEngine("E:/GameProjects/GameEngineLinux/_asset/asset/sandbox/d3renderer_cube/asset.db", 400, 400);
        e.MainLoop(this.l_engine, (p_step: EngineExternalStep) => {
            let l_frame = e.FrameCount(this.l_engine);
            let l_delta_time = e.DeltaTime(this.l_engine);
            if (l_frame == 1) {
                switch (p_step) {
                    case EngineExternalStep.BEFORE_UPDATE: {
                        this.l_camera_node = e.CreateNode(this.l_engine, new transform(new v3f(0, 0, 0), new quat(0, 0, 0, 1), new v3f(1, 1, 1)));
                        e.NodeAddCamera(this.l_engine, this.l_camera_node, new CameraComponent(1, 30, 45));
                        this.l_model_node = e.CreateNode(this.l_engine, new transform(new v3f(0, 0, 5), new quat(0, 0, 0, 1), new v3f(1, 1, 1)));
                        e.NodeAddMeshRenderer(this.l_engine, this.l_model_node, "block_1x1_material.json", "block_1x1.obj");
                    }
                        break;
                }
            } else if (l_frame > 1) {
                switch (p_step) {
                    case EngineExternalStep.BEFORE_UPDATE: {
                        e.NodeAddWorldRotation(this.l_engine, this.l_model_node, quat.rotate_around(new v3f(0, 1, 0), 3 * l_delta_time));
                    }
                        break;
                }
            }
        });
        e.RemoveNode(this.l_engine, this.l_camera_node);
        e.RemoveNode(this.l_engine, this.l_model_node);
        e.DestroyEngine(this.l_engine);
    };
}

new EngineTest().start();