import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Autentikasi" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            {/* EMAIL */}
                            <div style={{ display: 'grid', gap: '6px' }}>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* PASSWORD */}
                            <div style={{ display: 'grid', gap: '6px' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            style={{ fontSize: '0.78rem' }}
                                        >
                                            Lupa password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* REMEMBER */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <Checkbox id="remember" name="remember" />
                                <Label
                                    htmlFor="remember"
                                    style={{
                                        marginBottom: 0,
                                        textTransform: 'none',
                                        letterSpacing: 0,
                                        fontSize: '0.83rem',
                                    }}
                                >
                                    Ingat saya
                                </Label>
                            </div>

                            {/* SUBMIT */}
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Masuk
                            </Button>
                        </div>

                        {/* REGISTER LINK */}
                        {canRegister && (
                            <p
                                style={{
                                    textAlign: 'center',
                                    fontSize: '0.83rem',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                Belum punya akun?{' '}
                                <TextLink href={register()}>
                                    Daftar sekarang
                                </TextLink>
                            </p>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div
                    style={{
                        marginTop: '1rem',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.25)',
                        color: '#15803d',
                        fontSize: '0.83rem',
                        textAlign: 'center',
                    }}
                >
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Selamat Datang',
    description: 'Silakan masuk untuk melanjutkan',
};
