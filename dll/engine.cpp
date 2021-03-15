#include <node.h>
#include <Windows.h>
#include <stdlib.h>

typedef void(*p_EntryPoint)(void** p_args, int p_arg_length);

p_EntryPoint pp_EntryPoint;


void LoadDynamicLib(const v8::FunctionCallbackInfo<v8::Value>& args)
{
    v8::Isolate* isolate = args.GetIsolate();
    // v8::Local<v8::Value> l_path_value = args[0]->ToObject(isolate->GetCurrentContext()).ToLocalChecked();
    v8::String::Utf8Value l_shared_library_path(isolate, args[0]);
    char* l_path = l_shared_library_path.operator*();
    HMODULE l_engine_dll = LoadLibrary(l_path);
    pp_EntryPoint = (p_EntryPoint)GetProcAddress(l_engine_dll, "EntryPoint");
};


    void callback_caller(void** args, int argc)
    {
        v8::Local<v8::Function> l_function;
        memcpy(&l_function, &args[0], sizeof(v8::Local<v8::Function>));
        // = *((v8::Local<v8::Function>*)args[0]);
        v8::Local<v8::ArrayBuffer> l_buffer = v8::ArrayBuffer::New(l_function->GetIsolate(), args[2], *(size_t*)args[1]);
        l_function->Call(l_function->GetIsolate()->GetCurrentContext(), l_function->GetIsolate()->GetCurrentContext()->Global(), 1, (v8::Local<v8::Value>*) & l_buffer);
        l_buffer.Clear();
    };

    void EntryPoint(const v8::FunctionCallbackInfo<v8::Value>& args)
    {
        v8::Isolate* isolate = args.GetIsolate();
        int l_args_length = args.Length();

        void** l_internal_args = (void**)malloc(sizeof(void*) * l_args_length);
        for (int i = 0; i < l_args_length; i++)
        {
            l_internal_args[i] = args[i]->ToObject(isolate->GetCurrentContext()).ToLocalChecked().As<v8::ArrayBuffer>()->GetContents().Data();
        }
        pp_EntryPoint(l_internal_args, l_args_length);
        free(l_internal_args);
        args.GetReturnValue().SetUndefined();
    };

    void EntryPointWithFunction(const v8::FunctionCallbackInfo<v8::Value>& args)
    {
        v8::Isolate* isolate = args.GetIsolate();
        int l_args_length = args.Length() + 1;


        void** l_internal_args = (void**)malloc(sizeof(void*) * l_args_length);


        for (int i = 0; i < args.Length(); i++)
        {
            if (args[i]->IsArrayBuffer())
            {
                l_internal_args[i] = (void*)args[i]->ToObject(isolate->GetCurrentContext()).ToLocalChecked().As<v8::ArrayBuffer>()->GetContents().Data();
            }
            else if (args[i]->IsFunction())
            {
                v8::Local<v8::Function> l_function = args[i]->ToObject(isolate->GetCurrentContext()).ToLocalChecked().As<v8::Function>();
                void* l_function_pointer;
                memcpy((void*)&l_function_pointer, (void*)&l_function, sizeof(v8::Local<v8::Function>));
                l_internal_args[i] = l_function_pointer;
            }
        }

        l_internal_args[l_args_length - 1] = &callback_caller;

        pp_EntryPoint(l_internal_args, l_args_length);
        free(l_internal_args);
        args.GetReturnValue().SetUndefined();
    };

    void Initialize(v8::Local<v8::Object> exports) {

        NODE_SET_METHOD(exports, "LoadDynamicLib", LoadDynamicLib);
        NODE_SET_METHOD(exports, "EntryPoint", EntryPoint);
        NODE_SET_METHOD(exports, "EntryPointWithFunction", EntryPointWithFunction);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)